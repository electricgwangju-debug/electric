import React from 'react'
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

const { Header } = Layout

export default function AppHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        background: '#001529',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        ⚡ 적출율 관리 시스템
      </div>
      <Space>
        <span style={{ color: 'white' }}>{user?.username}</span>
        <Dropdown menu={{ items }} trigger={['click']}>
          <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </Space>
    </Header>
  )
}
