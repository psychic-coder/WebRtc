import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LobbyScreen from './Screens/Lobby'


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LobbyScreen/>} />
    </Routes>
  )
}

export default App