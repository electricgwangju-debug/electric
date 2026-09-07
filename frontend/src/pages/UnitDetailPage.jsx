import React, { useEffect, useState } from 'react'
import { Layout, Row, Col, Card, Statistic, Collapse, Table, Button, Modal, Form, Input, InputNumber, Space, Spin, Alert } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import AppHeader from '../components/Header'
import Sidebar from '../components/Sidebar'
import useAuthStore from '../stores/authStore'
import api from '../services/api'

const { Content } = Layout

export default function UnitDetailPage() {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [unit, setUnit] = useState(null)
  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedFrameId, setSelectedFrameId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchUnitDetail()
  }, [unitId])

  const fetchUnitDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const [unitRes, framesRes] = await Promise.all([
        api.get(`/units/${unitId}`),
        api.get(`/units/${unitId}/frames`),
      ])
      setUnit(unitRes.data)
      setFrames(framesRes.data)
    } catch (err) {
      setError('데이터 로드 실패')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (values) => {
    setIsSubmitting(true)
    try {
      await api.post(`/frames/${selectedFrameId}/items`, values)
      form.resetFields()
      setIsModalVisible(false)
      await fetchUnitDetail()
    } catch (error) {
      console.error('항목 추가 실패:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    Modal.confirm({
      title: '항목 삭제',
      content: '정말로 이 항목을 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.delete(`/items/${itemId}`)
          await fetchUnitDetail()
        } catch (error) {
          console.error('항목 삭제 실패:', error)
        }
      },
    })
  }

  const getFrameItems = (frameId) => {
    const frame = frames.find((f) => f.id === frameId)
    return frame?.items || []
  }

  const getFrameExtractionRate = (frameId) => {
    const items = getFrameItems(frameId)
    if (items.length === 0) return 0
    const sum = items.reduce((acc, item) => acc + (item.extraction_rate || 0), 0)
    return (sum / items.length).toFixed(2)
  }

  const itemColumns = [
    {
      title: '항목명',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
    },
    {
      title: '실제값',
      dataIndex: 'current_value',
      key: 'current_value',
      width: '20%',
      render: (text) => text?.toFixed(2) || 0,
    },
    {
      title: 'Upper Limit',
      dataIndex: 'upper_limit',
      key: 'upper_limit',
      width: '20%',
      render: (text) => text?.toFixed(2) || 0,
    },
    {
      title: '적출율',
      dataIndex: 'extraction_rate',
      key: 'extraction_rate',
      width: '20%',
      render: (text) => `${text?.toFixed(2) || 0}%`,
    },
    ...(isAdmin
      ? [
          {
            title: '작업',
            key: 'action',
            width: '10%',
            render: (_, record) => (
              <Button
                danger
                size="small"
                onClick={() => handleDeleteItem(record.id)}
              >
                삭제
              </Button>
            ),
          },
        ]
      : []),
  ]

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Content style={{ padding: '24px', textAlign: 'center' }}>
            <Spin tip="데이터를 로드하는 중입니다..." />
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
          <Space style={{ marginBottom: '24px' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              돌아가기
            </Button>
            <h2 style={{ margin: 0 }}>{unit?.name} - 상세 현황</h2>
          </Space>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

          {/* 호기 적출율 통계 */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="📈 호기 적출율"
                  value={
                    frames.length > 0
                      ? (
                          frames.reduce((sum, f) => sum + parseFloat(getFrameExtractionRate(f.id)), 0) /
                          frames.length
                        ).toFixed(2)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="설비 틀 개수"
                  value={frames.length}
                  suffix="개"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="호기 상태"
                  value={unit?.status === 'active' ? '✅ 정상' : '❌ 비활성'}
                />
              </Col>
            </Row>
          </Card>

          {/* 설비 틀별 상세 정보 */}
          <Card title="설비 틀별 항목">
            <Collapse
              items={frames.map((frame) => ({
                key: frame.id,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>🔧 {frame.name}</span>
                    <span style={{ marginRight: '20px', color: '#1890ff', fontWeight: 'bold' }}>
                      적출율: {getFrameExtractionRate(frame.id)}%
                    </span>
                  </div>
                ),
                children: (
                  <div>
                    <Table
                      columns={itemColumns}
                      dataSource={getFrameItems(frame.id)}
                      rowKey="id"
                      pagination={false}
                      style={{ marginBottom: '16px' }}
                    />
                    {isAdmin && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setSelectedFrameId(frame.id)
                          setIsModalVisible(true)
                        }}
                      >
                        항목 추가
                      </Button>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>

          {/* 항목 추가 모달 */}
          {isAdmin && (
            <Modal
              title="항목 추가"
              open={isModalVisible}
              onOk={() => form.submit()}
              onCancel={() => {
                setIsModalVisible(false)
                form.resetFields()
              }}
              confirmLoading={isSubmitting}
            >
              <Form
                form={form}
                onFinish={handleAddItem}
                layout="vertical"
              >
                <Form.Item
                  label="항목명"
                  name="name"
                  rules={[{ required: true, message: '항목명을 입력해주세요' }]}
                >
                  <Input placeholder="예: 항목1" />
                </Form.Item>
                <Form.Item
                  label="Upper Limit"
                  name="upper_limit"
                  rules={[{ required: true, message: 'Upper Limit을 입력해주세요' }]}
                >
                  <InputNumber min={0} step={0.1} placeholder="100" />
                </Form.Item>
                <Form.Item
                  label="설명"
                  name="description"
                >
                  <Input.TextArea placeholder="항목에 대한 설명" />
                </Form.Item>
              </Form>
            </Modal>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}
