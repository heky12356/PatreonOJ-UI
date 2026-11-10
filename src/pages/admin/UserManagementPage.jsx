import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getUserByUuid,
  getUserId,
  getUserList,
  getRoleCatalog,
  syncCurrentUserInfo,
  updateUserByUuid,
} from '../../api/user.js';



const parseRequestError = (error, fallback = '请求失败') => {
  const msg =
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;
  return String(msg);
};

const normalizeRoleCodes = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => String(role?.name || '').trim())
    .filter(Boolean);
};

const normalizePermissionTokens = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getStatusBadge = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'active') {
    return <Badge bg="success">正常</Badge>;
  }
  if (normalized === 'disabled') {
    return <Badge bg="danger">禁用</Badge>;
  }
  return <Badge bg="secondary">{status || '未知'}</Badge>;
};

export default function UserManagementPage() {
  const { uuid: selectedUuid } = useParams();
  const navigate = useNavigate();
  const operatorUuid = getUserId();

  const [draftKeyword, setDraftKeyword] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [draftRole, setDraftRole] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    role_code: '',
  });

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [users, setUsers] = useState([]);

  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [userDetail, setUserDetail] = useState(null);

  const [statusValue, setStatusValue] = useState('active');
  const [permissionsValue, setPermissionsValue] = useState('');
  const [selectedRoleCodes, setSelectedRoleCodes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [roleCatalog, setRoleCatalog] = useState([]);
  const [roleCatalogError, setRoleCatalogError] = useState('');
  const [roleCatalogLoading, setRoleCatalogLoading] = useState(true);
  const [roleCatalogRevision, setRoleCatalogRevision] = useState(0);

  useEffect(() => {
    let disposed = false;
    setRoleCatalogLoading(true);
    getRoleCatalog().then((roles) => { if (!disposed) { setRoleCatalog(roles); setRoleCatalogError(''); } })
      .catch((error) => { if (!disposed) { setRoleCatalog([]); setRoleCatalogError(parseRequestError(error, '角色列表加载失败')); } })
      .finally(() => { if (!disposed) setRoleCatalogLoading(false); });
    return () => { disposed = true; };
  }, [operatorUuid, roleCatalogRevision]);

  const availableRoleOptions = useMemo(() => {
    const codes = new Set(roleCatalog.map((role) => role.name));
    users.forEach((user) => {
      normalizeRoleCodes(user?.roles).forEach((code) => codes.add(code));
    });
    normalizeRoleCodes(userDetail?.roles).forEach((code) => codes.add(code));
    return Array.from(codes);
  }, [userDetail, users, roleCatalog]);

  useEffect(() => {
    const fetchUsers = async () => {
      setListLoading(true);
      setListError('');
      try {
        const response = await getUserList(filters, {
          operator_uuid: operatorUuid,
        });
        const rows = Array.isArray(response?.result) ? response.result : [];
        setUsers(rows);
      } catch (error) {
        setListError(parseRequestError(error, '获取用户列表失败'));
        setUsers([]);
      } finally {
        setListLoading(false);
      }
    };

    void fetchUsers();
  }, [filters, operatorUuid]);

  useEffect(() => {
    let disposed = false;
    const fetchDetail = async () => {
      if (!selectedUuid) { setUserDetail(null); setDetailError(''); return; }
      setDetailLoading(true); setDetailError(''); setUserDetail(null);
      try {
        const response = await getUserByUuid(selectedUuid, { operator_uuid: operatorUuid });
        if (disposed) return;
        const detail = response?.result ?? null;
        setUserDetail(detail);
        setStatusValue(detail?.status || 'active');
        setPermissionsValue(normalizePermissionTokens(detail?.direct_permissions ?? detail?.permissions).join(', '));
        setSelectedRoleCodes(normalizeRoleCodes(detail?.roles));
      } catch (error) {
        if (!disposed) { setDetailError(parseRequestError(error, '获取用户详情失败')); setUserDetail(null); }
      } finally { if (!disposed) setDetailLoading(false); }
    };
    void fetchDetail();
    return () => { disposed = true; };
  }, [operatorUuid, selectedUuid]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setFilters({
      keyword: draftKeyword.trim(),
      status: draftStatus,
      role_code: draftRole,
    });
  };

  const handleResetFilters = () => {
    setDraftKeyword('');
    setDraftStatus('');
    setDraftRole('');
    setFilters({
      keyword: '',
      status: '',
      role_code: '',
    });
  };

  const handleOpenDetail = (uuid) => {
    if (!uuid) return;
    navigate(`/admin/users/${uuid}`);
  };

  const handleRoleToggle = (roleCode) => {
    setSelectedRoleCodes((current) =>
      current.includes(roleCode)
        ? current.filter((code) => code !== roleCode)
        : [...current, roleCode]
    );
  };

  const handleDetailReset = () => {
    setStatusValue(userDetail?.status || 'active');
    setPermissionsValue(normalizePermissionTokens(userDetail?.direct_permissions ?? userDetail?.permissions).join(', '));
    setSelectedRoleCodes(normalizeRoleCodes(userDetail?.roles));
    setFeedback(null);
  };

  const refreshUsers = async () => {
    setListLoading(true);
    setListError('');
    try {
      const response = await getUserList(filters, {
        operator_uuid: operatorUuid,
      });
      setUsers(Array.isArray(response?.result) ? response.result : []);
    } catch (error) {
      setListError(parseRequestError(error, '获取用户列表失败'));
    } finally {
      setListLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!selectedUuid) return null;
    setDetailLoading(true);
    setDetailError('');
    try {
      const response = await getUserByUuid(selectedUuid, {
        operator_uuid: operatorUuid,
      });
      const detail = response?.result ?? null;
      setUserDetail(detail);
      return detail;
    } catch (error) {
      setDetailError(parseRequestError(error, '获取用户详情失败'));
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedUuid || userDetail?.uuid !== selectedUuid) return;

    setSaving(true);
    setFeedback(null);
    try {
      const response = await updateUserByUuid(
        selectedUuid,
        {
          status: statusValue,
          permissions: normalizePermissionTokens(permissionsValue).join(','),
          ...(JSON.stringify([...selectedRoleCodes].sort()) !== JSON.stringify(normalizeRoleCodes(userDetail?.roles).sort()) ? { role_codes: selectedRoleCodes } : {}),
        },
        {
          operator_uuid: operatorUuid,
        }
      );

      const updated = response?.result ?? (await refreshDetail());
      if (updated) {
        setUserDetail(updated);
        setStatusValue(updated?.status || 'active');
        setPermissionsValue(normalizePermissionTokens(updated?.direct_permissions ?? updated?.permissions).join(', '));
        setSelectedRoleCodes(normalizeRoleCodes(updated?.roles));
        if (selectedUuid === operatorUuid) {
          syncCurrentUserInfo(updated);
        }
      }

      await refreshUsers();
      setFeedback({ type: 'success', text: '用户信息已更新。' });
    } catch (error) {
      setFeedback({
        type: 'danger',
        text: parseRequestError(error, '更新用户失败'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center g-2 mb-3">
        <Col xs={12} md>
          <h2 className="mb-1">用户管理</h2>
          <div className="text-secondary small">查询用户、查看详情并修改状态、权限和角色。</div>
        </Col>
        <Col xs={12} md="auto">
          <Button as={Link} to="/admin" variant="outline-secondary">
            返回管理首页
          </Button>
        </Col>
      </Row>

      {roleCatalogError && <Alert variant="danger">{roleCatalogError} <Button size="sm" variant="outline-danger" onClick={() => setRoleCatalogRevision((value) => value + 1)}>重新加载角色</Button></Alert>}
      {feedback ? (
        <Alert variant={feedback.type} dismissible onClose={() => setFeedback(null)}>
          {feedback.text}
        </Alert>
      ) : null}

      <Row className="g-3">
        <Col xl={7}>
          <Card className="shadow-sm">
            <Card.Header>用户列表</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearchSubmit} className="mb-3">
                <Row className="g-2">
                  <Col md={5}>
                    <Form.Control
                      value={draftKeyword}
                      onChange={(event) => setDraftKeyword(event.target.value)}
                      placeholder="用户名 / 昵称 / 邮箱 / UUID"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value)}
                    >
                      <option value="">全部状态</option>
                      <option value="active">正常</option>
                      <option value="disabled">禁用</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={draftRole}
                      onChange={(event) => setDraftRole(event.target.value)}
                    >
                      <option value="">全部角色</option>
                      {availableRoleOptions.map((roleCode) => (
                        <option key={roleCode} value={roleCode}>
                          {roleCode}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2} className="d-flex gap-2">
                    <Button type="submit" className="w-100">
                      查询
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={handleResetFilters}
                    >
                      重置
                    </Button>
                  </Col>
                </Row>
              </Form>

              {listError ? (
                <Alert variant="danger" className="mb-3">
                  {listError}
                </Alert>
              ) : null}

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-secondary small">共 {users.length} 个结果</div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => void refreshUsers()}
                  disabled={listLoading}
                >
                  {listLoading ? '刷新中...' : '刷新'}
                </Button>
              </div>

              {listLoading ? (
                <div className="py-5 text-center">
                  <Spinner />
                </div>
              ) : (
                <Table hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>用户</th>
                      <th>状态</th>
                      <th>角色</th>
                      <th>权限</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-secondary py-4">
                          暂无匹配用户
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const permissions = normalizePermissionTokens(user?.permissions);
                        const roles = normalizeRoleCodes(user?.roles);
                        const active = selectedUuid === user?.uuid;
                        return (
                          <tr
                            key={user?.uuid || user?.id}
                            onClick={() => handleOpenDetail(user?.uuid)}
                            style={{ cursor: 'pointer' }}
                            className={active ? 'table-primary' : ''}
                          >
                            <td>
                              <div className="fw-semibold">
                                {user?.nickname || user?.username || user?.uuid}
                              </div>
                              <div className="small text-secondary">
                                @{user?.username || '-'}
                              </div>
                              <div className="small text-secondary">{user?.email || '未设置邮箱'}</div>
                            </td>
                            <td>{getStatusBadge(user?.status)}</td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {roles.length > 0 ? (
                                  roles.map((role) => (
                                    <Badge bg="light" text="dark" key={role}>
                                      {role}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-secondary small">无角色</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {permissions.length > 0 ? (
                                  permissions.map((permission) => (
                                    <Badge bg="secondary" key={permission}>
                                      {permission}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-secondary small">无权限</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="shadow-sm h-100">
            <Card.Header>用户详情</Card.Header>
            <Card.Body>
              {!selectedUuid ? (
                <div className="text-secondary py-5 text-center">
                  从左侧选择一个用户查看详情。
                </div>
              ) : detailLoading ? (
                <div className="py-5 text-center">
                  <Spinner />
                </div>
              ) : detailError ? (
                <Alert variant="danger" className="mb-0">
                  {detailError}
                </Alert>
              ) : !userDetail ? (
                <div className="text-secondary py-5 text-center">未找到该用户。</div>
              ) : (
                <Form onSubmit={handleSave}>
                  <div className="mb-3">
                    <div className="fw-semibold fs-5">
                      {userDetail?.nickname || userDetail?.username || userDetail?.uuid}
                    </div>
                    <div className="text-secondary small">@{userDetail?.username || '-'}</div>
                    <div className="text-secondary small mt-1">{userDetail?.uuid}</div>
                  </div>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>当前状态</Form.Label>
                        <Form.Select
                          value={statusValue}
                          onChange={(event) => setStatusValue(event.target.value)}
                          disabled={saving}
                        >
                          <option value="active">正常</option>
                          <option value="disabled">禁用</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>邮箱</Form.Label>
                        <Form.Control value={userDetail?.email || ''} disabled readOnly />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>权限</Form.Label>
                    <Form.Control
                      value={permissionsValue}
                      onChange={(event) => setPermissionsValue(event.target.value)}
                      placeholder="多个权限用逗号分隔，例如：admin,moderator"
                      disabled={saving}
                    />
                    <Form.Text className="text-secondary">
                      直接编辑权限字符串，保存时会按逗号拆分。
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>角色</Form.Label>
                    <div className="border rounded p-3">
                      <Row className="g-2">
                        {!availableRoleOptions.length && <Col className="text-secondary small">{roleCatalogLoading ? '正在加载角色…' : '暂无可用角色'}</Col>}
                        {availableRoleOptions.map((roleCode) => (
                          <Col xs={12} sm={6} key={roleCode}>
                            <Form.Check
                              id={`role-${roleCode}`}
                              type="checkbox"
                              label={roleCode}
                              checked={selectedRoleCodes.includes(roleCode)}
                              onChange={() => handleRoleToggle(roleCode)}
                              disabled={saving || roleCatalogLoading}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" disabled={saving || detailLoading || userDetail?.uuid !== selectedUuid}>
                      {saving ? '保存中...' : '保存修改'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={handleDetailReset}
                      disabled={saving}
                    >
                      重置
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => void refreshDetail()}
                      disabled={saving || detailLoading}
                    >
                      刷新详情
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
