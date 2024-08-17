import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate=useNav
  const socket=useSocket();

  const handleSubmitForm=useCallback((e)=>{
    e.preventDefault();
    socket.emit("room:join",{email,room})
    
  },[email,room,socket])

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );


  useEffect(() => {
    socket.on("room:join", handleJoinRoom);

    //our components render multiple time and we dont want the data to render multiple times so
    // socket.off is used to unsubscribe or remove a specific event listener, preventing the function from being called when the event is emitted in the future.
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  )
}

export default LobbyScreen