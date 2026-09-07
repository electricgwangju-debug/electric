import React from 'react'
import { Layout, Card, Alert } from 'antd'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../stores/authStore'

const { Content } = Layout

export default function SettingsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Content style={{ padding: '24px' }}>
            <Alert
              message="접근 권한 없음"
              description="관리자만 설정 페이지에 접근할 수 있습니다."
              type="warning"
              showIcon
            />
          </Content>
        </Layout>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <Sidebar />
        <Content style={{ padding: '24px' }}>
          <Card title="설정">
            <Alert
              message="준비 중"
              description="설정 페이지는 준비 중입니다."
              type="info"
              showIcon
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
