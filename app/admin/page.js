'use client'


import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Shield, Package, DollarSign, Truck, Save, RefreshCw, LogOut, ExternalLink } from 'lucide-react'


// 初始化 Supabase 客户端 (云账本)
const supabase = createClient(
  'https://olgfqcygqzuevaftmdja.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2ZxY3lncXp1ZXZhZnRtZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTQ3MTcsImV4cCI6MjA5MTQ3MDcxN30._ZqLwFzh2TvBeicpwVzwLQLVTPiTm4uFd-gwwmLvYRY'
)


export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [prices, setPrices] = useState({
    starter: 19.99,
    family: 34.99,
    'eco-refill': 24.99
  })
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')


  // 简单的登录逻辑 (生产环境建议使用 Supabase Auth)
  const handleLogin = () => {
    if (password === 'clowand888') {
      setIsLoggedIn(true)
    } else {
      alert('Incorrect Password')
    }
  }


  // 从 Supabase 获取真实订单数据
  const fetchOrders = async () => {
    setLoading(true)
