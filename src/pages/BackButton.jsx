import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ to = -1, children = '← Back' }){
  const nav = useNavigate()
  return (
    <button className="dx-btn" onClick={() => nav(to)}>{children}</button>
  )
}
