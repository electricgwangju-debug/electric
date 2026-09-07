import React, { useState } from 'react'
import { Form, Input, Button, Card, Row, Col, Alert, Spin } from 'antd'
import { UserOutlined, LockOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function LoginPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  const [localError, setLocalError] = useState(null)

  const handleLogin = async (values) => {
    setLocalError(null)
    const success = await login(values.username, values.password)
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Row gutter={16} style={{ width: '100%', maxWidth: '500px', padding: '20px' }}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <ThunderboltOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <h1 style={{ marginTop: '10px' }}>적출율 관리 시스템</h1>
              <p style={{ color: '#666' }}>로그인하여 시작하세요</p>
            </div>

            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

            <Spin spinning={loading}>
              <Form
                form={form}
                onFinish={handleLogin}
                layout="vertical"
                requiredMark="optional"
              >
                <Form.Item
                  label="사용자명"
                  name="username"
                  rules={[{ required: true, message: '사용자명을 입력해주세요' }]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="admin@electric.com"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="비밀번호"
                  name="password"
                  rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="비밀번호"
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" block size="large" htmlType="submit" loading={loading}>
                    로그인
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f0f2f5', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>테스트 계정 (관리자):</strong> admin@electric.com / admin123
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                  <strong>테스트 계정 (조회):</strong> viewer@electric.com / viewer123
                </p>
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
