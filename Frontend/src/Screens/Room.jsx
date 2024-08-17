import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import {ReactPlayer} from "react-player"

const Room = () => {
  const socket = useSocket();
  const [myStream, setMyStream] = useState();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined the room`);
    setRemoteSocketId(id);
  }, []);
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
  }, []);
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
      {myStream &&
      
      <>
      <h1>My Stream</h1>
      <ReactPlayer playing muted height="200px" width="200px" url={myStream}/>
      </> }
    </div>
  );
};

export default Room;
