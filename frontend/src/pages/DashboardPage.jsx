import React, { useEffect } from 'react'
import { Layout, Row, Col, Card, Statistic, Table, Button, Modal, Form, Input, InputNumber, Space, Spin, Alert } from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import useDashboardStore from '../stores/dashboardStore'
import useAuthStore from '../stores/authStore'
import api from '../services/api'

const { Content } = Layout

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { overallExtractionRate, units, loading, error, fetchDashboard } = useDashboardStore()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const isAdmin = user?.role === 'admin'

  const handleAddUnit = async (values) => {
    setIsLoading(true)
    try {
      await api.post('/units', values)
      form.resetFields()
      setIsModalVisible(false)
      await fetchDashboard()
    } catch (error) {
      console.error('호기 추가 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUnit = async (unitId) => {
    Modal.confirm({
      title: '호기 삭제',
      content: '정말로 이 호기를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/units/${unitId}`)
          await fetchDashboard()
        } catch (error) {
          console.error('호기 삭제 실패:', error)
        }
      },
    })
  }

  const columns = [
    {
      title: '호기명',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: '코드',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
    },
    {
      title: '적출율',
      dataIndex: 'extraction_rate',
      key: 'extraction_rate',
      width: '20%',
      render: (text) => `${text?.toFixed(2) || 0}%`,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: '20%',
      render: (status) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#f5222d' }}>
          {status === 'active' ? '✅ 정상' : '❌ 비활성'}
        </span>
      ),
    },
    {
      title: '작업',
      key: 'action',
      width: '20%',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/unit/${record.id}`)}
          >
            상세보기
          </Button>
          {isAdmin && (
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUnit(record.id)}
            >
              삭제
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <Sidebar />
        <Content style={{ padding: '24px' }}>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin tip="데이터를 로드하는 중입니다..." />
            </div>
          ) : (
            <>
              {/* 종합 적출율 카드 */}
              <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="📊 종합 적출율"
                      value={overallExtractionRate}
                      suffix="%"
                      precision={2}
                      valueStyle={{ color: overallExtractionRate >= 90 ? '#52c41a' : '#ff7a45' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="목표 달성률"
                      value={(overallExtractionRate / 100) * 100}
                      suffix="%"
                      precision={1}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="활성 호기 수"
                      value={units.filter((u) => u.status === 'active').length}
                      suffix="개"
                    />
                  </Col>
                </Row>
              </Card>

              {/* 호기 목록 */}
              <Card
                title="호기 목록"
                extra={
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => fetchDashboard()}>
                      새로고침
                    </Button>
                    {isAdmin && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                      >
                        호기 추가
                      </Button>
                    )}
                  </Space>
                }
              >
                <Table
                  columns={columns}
                  dataSource={units}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `총 ${total}개`,
                  }}
                />
              </Card>

              {/* 호기 추가 모달 */}
              {isAdmin && (
                <Modal
                  title="호기 추가"
                  open={isModalVisible}
                  onOk={() => form.submit()}
                  onCancel={() => {
                    setIsModalVisible(false)
                    form.resetFields()
                  }}
                  confirmLoading={isLoading}
                >
                  <Form
                    form={form}
                    onFinish={handleAddUnit}
                    layout="vertical"
                  >
                    <Form.Item
                      label="호기명"
                      name="name"
                      rules={[{ required: true, message: '호기명을 입력해주세요' }]}
                    >
                      <Input placeholder="예: 호기1" />
                    </Form.Item>
                    <Form.Item
                      label="코드"
                      name="code"
                      rules={[{ required: true, message: '코드를 입력해주세요' }]}
                    >
                      <Input placeholder="예: UNIT001" />
                    </Form.Item>
                  </Form>
                </Modal>
              )}
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}
