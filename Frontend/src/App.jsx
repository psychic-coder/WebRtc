import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LobbyScreen from './Screens/Lobby'
import Room from './Screens/Room'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LobbyScreen/>} />
      <Route path="/room/:roomId" element={<Room/>} />
    </Routes>
  )
}

export default App