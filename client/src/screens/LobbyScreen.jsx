import React, {useState, useCallback} from "react";
import { useSocket } from "../context/SocketProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        socket.emit("join:room", {email, room, socketId: socket.id});
        

    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const {email, room} = data;
        navigate(`/room/${room}`);
    }, [navigate]);

    useEffect(() => {
        socket.on("join:room", handleJoinRoom);
            // console.log(`Joinedwss room: data from backend ${data}`);
        return () => {
            socket.off("join:room", handleJoinRoom);
        };
    }, [socket]);

    return (
        <div>
            <h1>Lobby</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email: </label>
                <input 
                    type="email" 
                    className="border border-gray-300 p-2 rounded-md m-4"
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
                <br />
                <label htmlFor="room">Room: </label>
                <input 
                    type="text"
                    className="border border-gray-300 p-2 rounded-md m-4"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                />
                <br />
                <button type="submit">Join Room</button>
            </form>
        </div>
    );
};

export default LobbyScreen;
