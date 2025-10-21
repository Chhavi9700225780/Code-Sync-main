import { DrawingData } from "@/types/app"
import {
    SocketContext as SocketContextType,
    SocketEvent,
    SocketId,
} from "@/types/socket"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { useAppContext } from "./AppContext"

const SocketContext = createContext<SocketContextType | null>(null)

export const useSocket = (): SocketContextType => {
  
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
  const WebRTCSocketEvent = {
    WEBRTC_OFFER: "webrtc-offer",
    WEBRTC_ANSWER: "webrtc-answer",
    WEBRTC_ICE_CANDIDATE: "webrtc-ice-candidate",
}
const STUN_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
}
const SocketProvider = ({ children }: { children: ReactNode }) => {
    const {
        users,
        setUsers,
        setStatus,
        setCurrentUser,
        drawingData,
        setDrawingData,
        localStream,
        setRemoteStreams,
        currentUser,
    } = useAppContext()
    const socket: Socket = useMemo(
        () =>
            io(BACKEND_URL, {
                reconnectionAttempts: 2,
            }),
        [],
    )
const peerConnections = useRef<Map<SocketId, RTCPeerConnection>>(new Map())
    const handleError = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: any) => {
            console.log("socket error", err)
            setStatus(USER_STATUS.CONNECTION_FAILED)
            toast.dismiss()
            toast.error("Failed to connect to the server")
        },
        [setStatus],
    )

    const handleUsernameExist = useCallback(() => {
        toast.dismiss()
        setStatus(USER_STATUS.INITIAL)
        toast.error(
            "The username you chose already exists in the room. Please choose a different username.",
        )
    }, [setStatus])

    const handleJoiningAccept = useCallback(
        ({ user, users }: { user: User; users: RemoteUser[] }) => {
            setCurrentUser(user)
            setUsers(users)
            toast.dismiss()
            setStatus(USER_STATUS.JOINED)

            if (users.length > 1) {
                toast.loading("Syncing data, please wait...")
            }
        },
        [setCurrentUser, setStatus, setUsers],
    )
    const closePeerConnection = useCallback((socketId: SocketId) => {
        peerConnections.current.get(socketId)?.close()
        peerConnections.current.delete(socketId)
        setRemoteStreams(prev => {
            const newStreams = new Map(prev)
            newStreams.delete(socketId)
            return newStreams
        })
    }, [setRemoteStreams])

    const createPeerConnection = useCallback((socketId: SocketId, isOfferor: boolean) => {
        const pc = new RTCPeerConnection(STUN_SERVERS)
        peerConnections.current.set(socketId, pc)

        // Add your local video/audio tracks to the connection
        localStream?.getTracks().forEach(track => {
            pc.addTrack(track, localStream)
        })

        // When the OTHER user sends their video, add it to remoteStreams
        pc.ontrack = event => {
            setRemoteStreams(prev =>
                new Map(prev).set(socketId, event.streams[0]),
            )
        }

        // Handle network negotiation
        pc.onicecandidate = event => {
            if (event.candidate) {
                socket.emit(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE, {
                    to: socketId,
                    candidate: event.candidate,
                })
            }
        }

        // If you are the "offeror" (the one starting the call), create an offer
        if (isOfferor) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    socket.emit(WebRTCSocketEvent.WEBRTC_OFFER, {
                        to: socketId,
                        offer: pc.localDescription,
                    })
                })
        }

        return pc
    }, [localStream, setRemoteStreams, socket])


    const handleOffer = useCallback(async ({ from, offer }: { from: SocketId; offer: RTCSessionDescriptionInit }) => {
        const pc = createPeerConnection(from, false) // Create connection, false = not offeror
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit(WebRTCSocketEvent.WEBRTC_ANSWER, {
            to: from,
            answer: pc.localDescription,
        })
    }, [createPeerConnection, socket])

    const handleAnswer = useCallback(async ({ from, answer }: { from: SocketId; answer: RTCSessionDescriptionInit }) => {
        const pc = peerConnections.current.get(from)
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer))
        }
    }, [])

    const handleIceCandidate = useCallback(async ({ from, candidate }: { from: SocketId; candidate: RTCIceCandidateInit }) => {
        const pc = peerConnections.current.get(from)
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
        }
    }, [])


    const handleUserLeft = useCallback(
        ({ user }: { user: User }) => {
            toast.success(`${user.username} left the room`)
            setUsers(users.filter((u: User) => u.username !== user.username))
            // --- NEW ---
            // Find the socketId from the username (you might need to adjust this)
            const remoteUser = users.find(u => u.username === user.username)
            if (remoteUser) {
                closePeerConnection(remoteUser.socketId)
            }
            // --- END NEW ---
        },
        [setUsers, users, closePeerConnection],
    )

    const handleRequestDrawing = useCallback(
        ({ socketId }: { socketId: SocketId }) => {
            socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawingData })
        },
        [drawingData, socket],
    )
useEffect(() => {
        if (!localStream || !currentUser) return

        // Connect to all existing users
        users.forEach(user => {
            if (!peerConnections.current.has(user.socketId)) {
                createPeerConnection(user.socketId, true) // true = I am the offeror
            }
        })

    }, [localStream, users, currentUser, createPeerConnection])

    const handleDrawingSync = useCallback(
        ({ drawingData }: { drawingData: DrawingData }) => {
            setDrawingData(drawingData)
        },
        [setDrawingData],
    )

    useEffect(() => {
        socket.on("connect_error", handleError)
        socket.on("connect_failed", handleError)
        socket.on(SocketEvent.USERNAME_EXISTS, handleUsernameExist)
        socket.on(SocketEvent.JOIN_ACCEPTED, handleJoiningAccept)
        socket.on(SocketEvent.USER_DISCONNECTED, handleUserLeft)
        socket.on(SocketEvent.REQUEST_DRAWING, handleRequestDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleDrawingSync)
socket.on(WebRTCSocketEvent.WEBRTC_OFFER, handleOffer)
        socket.on(WebRTCSocketEvent.WEBRTC_ANSWER, handleAnswer)
        socket.on(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE, handleIceCandidate)
        return () => {
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(SocketEvent.USERNAME_EXISTS)
            socket.off(SocketEvent.JOIN_ACCEPTED)
            socket.off(SocketEvent.USER_DISCONNECTED)
            socket.off(SocketEvent.REQUEST_DRAWING)
            socket.off(SocketEvent.SYNC_DRAWING)
            socket.off(WebRTCSocketEvent.WEBRTC_OFFER)
            socket.off(WebRTCSocketEvent.WEBRTC_ANSWER)
            socket.off(WebRTCSocketEvent.WEBRTC_ICE_CANDIDATE)
        }
    }, [
        handleDrawingSync,
        handleError,
        handleJoiningAccept,
        handleRequestDrawing,
        handleUserLeft,
        handleUsernameExist,
        setUsers,
        socket,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
    ])

    return (
        <SocketContext.Provider
            value={{
                socket,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export { SocketProvider }
export default SocketContext
