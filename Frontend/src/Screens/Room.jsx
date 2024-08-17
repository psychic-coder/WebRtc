import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);
  const handleCallUser=useCallback(async()=>{
        const stream=await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })  },[]);
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);

    return () => {
      socket.off("user:joined", handleUserJoined);
    };
  }, [socket, handleUserJoined]);
  return (
    <div>
      <h1>Room Page</h1>
      <h1>{remoteSocketId ? "Connected" : "No one in room"}</h1>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
    </div>
  );
};

export default Room;
