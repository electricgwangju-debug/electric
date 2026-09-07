import React from 'react'
import { Layout, Menu } from 'antd'
import { DashboardOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const { Sider } = Layout

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const items = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    ...(isAdmin
      ? [
          {
            key: '/settings',
            icon: <SettingOutlined />,
            label: '설정',
          },
        ]
      : []),
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '보고서',
    },
  ]

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth={0}
      style={{
        background: '#001529',
        minHeight: '100vh',
      }}
    >
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        selectedKeys={[location.pathname]}
        items={items}
        onClick={(e) => navigate(e.key)}
      />
    </Sider>
  )
}
