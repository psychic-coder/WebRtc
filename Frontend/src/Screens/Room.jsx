import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player"; // React component for playing media, used to render streams
import peer from "../service/peer"; // Importing the PeerService class for managing WebRTC connections
import { useSocket } from "../context/SocketProvider"; // Custom hook to access the Socket.io instance

const RoomPage = () => {
  const socket = useSocket(); // Getting the Socket.io instance from context
  const [remoteSocketId, setRemoteSocketId] = useState(null); // State to store the socket ID of the remote peer
  const [myStream, setMyStream] = useState(); // State to store the local media stream
  const [remoteStream, setRemoteStream] = useState(); // State to store the remote media stream

  // Callback to handle when a user joins the room
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id); // Store the remote user's socket ID
  }, []);

  // Callback to handle calling the remote user
  const handleCallUser = useCallback(async () => {
    // Get local media (audio and video)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    // Generate an offer for the WebRTC connection
    const offer = await peer.getOffer();

    // Emit a Socket.io event to send the offer to the remote user
    socket.emit("user:call", { to: remoteSocketId, offer });

    // Store the local media stream in state
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  // Callback to handle incoming call from a remote user
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from); // Set the socket ID of the user calling you

      // Get local media (audio and video)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream); // Store the local media stream in state
      console.log(`Incoming Call`, from, offer);

      // Generate an answer to the received offer
      const ans = await peer.getAnswer(offer);

      // Emit a Socket.io event to send the answer back to the caller
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  // Function to send local media streams (audio and video) to the peer
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      // Add each media track (audio, video) to the peer connection
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  // Callback to handle when the call is accepted by the remote user
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      // Set the local description using the answer received from the remote peer
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams(); // Send the local media streams to the peer
    },
    [sendStreams]
  );

  // Callback to handle negotiation needed event (triggered when renegotiation is required)
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer(); // Create a new offer
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId }); // Notify the remote peer about the new offer
  }, [remoteSocketId, socket]);

  // Adding and removing event listeners for negotiation
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded); // Listen for the 'negotiationneeded' event
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded); // Cleanup event listener on unmount
    };
  }, [handleNegoNeeded]);

  // Callback to handle incoming negotiation needed offer
  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer); // Generate an answer to the received offer
      socket.emit("peer:nego:done", { to: from, ans }); // Send the answer back to the remote peer
    },
    [socket]
  );

  // Callback to handle final negotiation answer
  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans); // Set the local description using the final negotiation answer
  }, []);

  // Listening for remote tracks (media streams) from the peer
  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams; // Retrieve the remote media streams
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]); // Store the remote stream in state
    });
  }, []);

  // Setup Socket.io event listeners when the component mounts
  useEffect(() => {
    socket.on("user:joined", handleUserJoined); // Listen for when a user joins the room
    socket.on("incomming:call", handleIncommingCall); // Listen for incoming calls
    socket.on("call:accepted", handleCallAccepted); // Listen for when a call is accepted
    socket.on("peer:nego:needed", handleNegoNeedIncomming); // Listen for negotiation needed events
    socket.on("peer:nego:final", handleNegoNeedFinal); // Listen for final negotiation answers

    return () => {
      // Cleanup event listeners on unmount
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // Render the RoomPage UI
  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>} {/* Button to send local stream */}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>} {/* Button to initiate a call */}
      
      {/* Render the local stream using ReactPlayer */}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}

      {/* Render the remote stream using ReactPlayer */}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default RoomPage;


/*
State Management:
remoteSocketId: Holds the Socket.io ID of the remote user (the peer you're trying to connect with).
myStream: Stores the local media stream (audio and video) that will be sent to the remote peer.
remoteStream: Stores the media stream received from the remote peer.


Socket.io Events:
The component listens for various events (user:joined, incomming:call, call:accepted, peer:nego:needed, peer:nego:final) to handle the signaling required for WebRTC connections.
These events are used to exchange offers, answers, and ICE candidates between peers.

WebRTC Peer Connection:
Offer/Answer Exchange: The handleCallUser, handleIncommingCall, handleCallAccepted, and related callbacks manage the offer/answer exchange for WebRTC connections.

Media Streams: The local media stream (myStream) is captured using navigator.mediaDevices.getUserMedia and then added to the peer connection using addTrack.

Remote Stream: When the remote peer sends its media stream, it is received via the track event and stored in remoteStream.
*/