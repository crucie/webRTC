import react, { useEffect, useCallback, useState, useRef } from 'react'
import { useSocket } from '../context/SocketProvider'
import Peer from '../service/Peer';


function Room() {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState();
    const [localStream, setLocalStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const handleCallUser = useCallback( async() => {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        // const streamUrl = URL.createObjectURL(stream);
        const offer = await Peer.getOffer();
        socket.emit("user:call", { offer, to: remoteSocketId });

        setLocalStream(stream);
        
    }, [remoteSocketId, socket])

    const handleUserJoined = useCallback(({email, id}) => {
        console.log(`User Joined: ${email} with ID: ${id}`);
        setRemoteSocketId(id);
    }, []);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const handleIncomingCall = useCallback( async({from, offer}) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        setLocalStream(stream);
        console.log(`Incoming call from ${from} with offer:`, offer);
        const ans = await Peer.getAnswer(offer);

        socket.emit("call:accepted", {to: from, answer: ans} );
    }, [socket])

    // const sendStreams = () => {
    //     for (const track of localStream.getTracks()) {
    //         Peer.peer.addTrack(track, localStream)
    //     }
    // }


    const handleCallAccepted = useCallback( ({from , ans}) => {
        Peer.setLocalDescription(ans)
        console.log("Call Accepted");

        
    }, [localStream])

    const handleNegoNeeded = useCallback(async () => {
            const offer = await Peer.getOffer();
            socket.emit('peer:nego:needed', {offer, to: remoteSocketId})
    }, [socket, remoteSocketId])

    const handleNegoNeedIncoming = useCallback((from , offer) => {
        const ans = Peer.getAnswer(offer);
        socket.emit('peer:nego:done', {to: from, ans})

    }, [socket])

    const handleNegoNeedFinal = useCallback(
      async ({ans}) => {
        await Peer.setLocalDescription(ans)
      },
      [],
    )

    useEffect( () => {
        Peer.peer.addEventListener('negotiationneeded', handleNegoNeeded )
        return () => {
            Peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        }
    }, [handleNegoNeeded])

    useEffect( () => {
        Peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            setRemoteStream(remoteStream);
        })
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeedIncoming)|
        socket.on('peer:neg:final', handleNegoNeedFinal)

        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeedIncoming);
            socket.off('peer:nego:final', handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedFinal, handleNegoNeedIncoming]);

  return (
    <div>
        <h1>Room</h1>
        <p>{remoteSocketId? "Connected ":  "Not Connected"}</p>
        {remoteSocketId && <button onClick={handleCallUser}>Call User</button>}
        {remoteStream && <button onClick={sendStreams}> Send Stream</button>}
        {localStream && 
            <video
                ref={localVideoRef}
                autoPlay
                muted
                className='border border-amber-400 z-100'
                width="200"
                height="150"
            /> 
        }
        {remoteStream &&
            <video
                ref={remoteVideoRef}
                autoPlay
                muted
                width = "300"
                height = "200"
            />
        }

    </div>
  )
}

export default Room