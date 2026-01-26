import React from 'react'
import { useEffect } from 'react'
import { useSocket } from '../context/SocketProvider'


function Room() {
    const socket = useSocket();

    useEffect(() => {}, [])

  return (
    <div>Room</div>
  )
}

export default Room