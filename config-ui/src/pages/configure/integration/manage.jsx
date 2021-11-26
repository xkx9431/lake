import React, { useEffect, useState, useCallback } from 'react'
import {
  useParams,
  Link,
  useHistory
} from 'react-router-dom'
import {
  Button, Card, Elevation, Colors,
  Tooltip,
  Position,
  Icon,
  Intent,
  Popover,
} from '@blueprintjs/core'
import Nav from '@/components/Nav'
import Sidebar from '@/components/Sidebar'
import AppCrumbs from '@/components/Breadcrumbs'
import Content from '@/components/Content'
import { ToastNotification } from '@/components/Toast'
import useConnectionManager from '@/hooks/useConnectionManager'

import { integrationsData } from '@/data/integrations'
import DeleteAction from '@/components/actions/DeleteAction'
import DeleteConfirmationMessage from '@/components/actions/DeleteConfirmationMessage'
import ContentLoader from '@/components/loaders/ContentLoader'

import '@/styles/integration.scss'

export default function ManageIntegration () {
  const history = useHistory()

  const { providerId } = useParams()

  const [integrations, setIntegrations] = useState(integrationsData)
  const [activeProvider, setActiveProvider] = useState(integrations.find(p => p.id === providerId))
  const [isRunningDelete, setIsRunningDelete] = useState(false)

  const [deleteId, setDeleteId] = useState()

  const {
    sourceLimits,
    Providers,
    allConnections: connections,
    isFetching: isLoading,
    isDeleting: isDeletingConnection,
    deleteConnection,
    fetchAllConnections,
    errors,
    deleteComplete,
    testConnection
  } = useConnectionManager({
    activeProvider
  })

  useEffect(() => {

  }, [activeProvider])

  const addConnection = () => {
    history.push(`/connections/add/${activeProvider.id}`)
  }

  const editConnection = (connection, e) => {
    console.log(e.target.classList)
    if (e.target && (!e.target.classList.contains('cell-actions') || !e.target.classList.contains('actions-link'))) {
      history.push(`/connections/edit/${activeProvider.id}/${connection.id}`)
    }
  }

  const configureConnection = (connection) => {
    const { id, endpoint } = connection
    history.push(`/connections/configure/${activeProvider.id}/${id}`)
    console.log('>> editing/modifying connection: ', id, endpoint)
  }


  const runCollection = (connection) => {
    const { id, endpoint } = connection
    ToastNotification.clear()
    ToastNotification.show({ message: `Triggered Collection Process on ${connection.name}`, icon: 'info-sign' })
    console.log('>> running connection: ', id, endpoint)
  }

  const runDeletion = (connection) => {
    setIsRunningDelete(true)
    try {
      deleteConnection(connection)
    } catch (e) {
      ToastNotification.show({ message: `Failed to remove instance ${connection.name}`, icon: 'warning-sign' })
    }
  }

  const refreshConnections = () => {
    fetchAllConnections(true)
  }

  const maxConnectionsExceeded = (limit, totalConnections) => {
    return totalConnections > 0 && totalConnections >= limit
  }

  useEffect(() => {
    fetchAllConnections(true)
  }, [activeProvider, fetchAllConnections])

  useEffect(() => {
    console.log('>> ACTIVE PROVIDER = ', providerId)
    setIntegrations(integrations)
    setActiveProvider(integrations.find(p => p.id === providerId))
  }, [])

  useEffect(() => {
    console.log('>> CONNECTION SOURCE LIMITS', sourceLimits)
  }, [connections, sourceLimits])

  useEffect(() => {
    let flushTimeout
    if (deleteComplete && deleteComplete.connection) {
      flushTimeout = setTimeout(() => {
        setDeleteId(null)
        setIsRunningDelete(false)
        fetchAllConnections(false)
      }, 500)
    }

    return () => clearTimeout(flushTimeout)
  }, [deleteComplete, fetchAllConnections])

  return (
    <>
      <div className='container'>
        <Nav />
        <Sidebar />
        <Content>
          <main className='main'>
            <AppCrumbs
              items={[
                { href: '/', icon: false, text: 'Dashboard' },
                { href: '/integrations', icon: false, text: 'Integrations' },
                { href: `/integrations/${activeProvider.id}`, icon: false, text: `${activeProvider.name}`, current: true },
              ]}
            />
            <div className='headlineContainer'>
              <Link style={{ float: 'right', marginLeft: '10px', color: '#777777' }} to='/integrations'>
                <Icon icon='fast-backward' size={16} /> Go Back
              </Link>
              <div style={{ display: 'flex' }}>
                <div>
                  <span style={{ marginRight: '10px' }}>{activeProvider.icon}</span>
                </div>
                <div>
                  <h1 style={{ margin: 0 }}>
                    {activeProvider.name} Integration
                  </h1>
                  <p className='description'>Manage integration and connections.</p>
                </div>
              </div>
            </div>
            <div className='manageProvider'>
              {errors && errors.length > 0 && (
                <Card interactive={false} elevation={Elevation.TWO} style={{ width: '100%', marginBottom: '20px' }}>
                  <div style={{}}>
                    <h4 className='bp3-heading'>
                      <Icon icon='warning-sign' size={18} color={Colors.RED5} style={{ marginRight: '10px' }} />
                      Warning &mdash; This integration has issues
                    </h4>
                    <p className='bp3-ui-text bp3-text-large' style={{ margin: 0 }}>
                      Please see below for all messages that will need to be resolved.
                    </p>
                  </div>
                </Card>
              )}
              {isLoading && (
                <ContentLoader title='Loading Connections ...' message='Please wait while the connections are loaded.' />
              )}
              {!isLoading && connections && connections.length === 0 && (
                <Card interactive={false} elevation={Elevation.TWO} style={{ width: '100%', marginBottom: '20px' }}>
                  <div style={{}}>
                    <h4 className='bp3-heading'>
                      <Icon icon='offline' size={18} color={Colors.GRAY3} style={{ marginRight: '10px' }} /> No Connection Entries
                    </h4>
                    <p className='bp3-ui-text bp3-text-large' style={{ margin: 0 }}>
                      Please check your connection settings and try again.
                      Also verify the authentication token (if applicable) for accuracy.
                    </p>
                    <p className='bp3-monospace-text' style={{ margin: '0 0 20px 0', fontSize: '10px', color: Colors.GRAY4 }}>
                      If the problem persists, please contact our team on <strong>GitHub</strong>
                    </p>
                    <p>
                      <Button
                        onClick={addConnection}
                        rightIcon='add'
                        intent='primary'
                        text='Add Connection'
                        style={{ marginRight: '10px' }}
                      />
                      <Button rightIcon='refresh' text='Refresh Connections' minimal onClick={refreshConnections} />
                    </p>

                  </div>
                </Card>
              )}
              {!isLoading && connections && connections.length > 0 && (
                <>
                  <p>
                    <Button
                      disabled={maxConnectionsExceeded(sourceLimits[activeProvider.id], connections.length)}
                      onClick={addConnection}
                      rightIcon='add'
                      intent='primary'
                      text='Add Connection'
                      style={{ marginRight: '10px' }}
                    />
                    <Button rightIcon='refresh' text='Refresh Connections' minimal onClick={refreshConnections} />
                  </p>
                  <Card interactive={false} elevation={Elevation.TWO} style={{ width: '100%', padding: '2px' }}>
                    <table className='bp3-html-table bp3-html-table-bordered connections-table' style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          {activeProvider.id === Providers.JIRA && (<th>ID</th>)}
                          <th>Connection Name</th>
                          <th>Endpoint</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {connections.map((connection, idx) => (
                          <tr
                            key={`connection-row-${idx}`}
                            className={connection.status === 0 ? 'connection-offline' : ''}
                          >
                            {activeProvider.id === Providers.JIRA && (
                              <td
                                style={{ cursor: 'pointer' }}
                                className='cell-name'
                              >
                                <Tooltip content='Use this SourceID for Triggers' position={Position.TOP}>
                                  <span style={{ color: Colors.BLUE3, fontWeight: 'bold' }}>
                                    {connection.ID}
                                  </span>
                                </Tooltip>
                              </td>
                            )}
                            <td
                              onClick={(e) => configureConnection(connection, e)}
                              style={{ cursor: 'pointer' }}
                              className='cell-name'
                            >
                              {/* <Icon icon='power' color={Colors.GRAY4} size={10} style={{ float: 'right', marginLeft: '10px' }} /> */}
                              <strong>
                                {connection.name || connection.Name}
                              </strong>
                              <a
                                href='#'
                                data-provider={connection.id}
                                className='table-action-link'
                                onClick={(e) => editConnection(connection, e)}
                              />
                            </td>
                            <td
                              className='cell-endpoint'
                              onClick={(e) => configureConnection(connection, e)}
                              style={{ cursor: 'pointer' }}
                            >
                              {connection.endpoint || connection.Endpoint}
                              {!connection.endpoint && !connection.Endpoint && (<span style={{ color: Colors.GRAY4 }}>( Empty )</span>)}
                            </td>
                            <td className='cell-status'>
                              {connection.status === 0 && (
                                <strong style={{ color: Colors.GRAY4 }}>Offline</strong>
                              )}
                              {connection.status === 1 && (
                                <strong style={{ color: Colors.GREEN3 }}>Online</strong>
                              )}
                              {connection.status === 2 && (
                                <strong style={{ color: Colors.RED3 }}>Error</strong>
                              )}
                              {connection.status === 3 && (
                                <strong style={{ color: Colors.BLUE3 }}>
                                  <Icon icon='array' size={14} color={Colors.GRAY2} /> Collecting...
                                </strong>
                              )}
                            </td>
                            <td className='cell-actions'>
                              <a
                                href='#'
                                data-provider={connection.id}
                                className='table-action-link actions-link'
                                // onClick={() => editConnection(connection)}
                                onClick={(e) => configureConnection(connection, e)}
                              >
                                <Icon icon='settings' size={12} />
                                Settings
                              </a>
                              {activeProvider?.multiSource && (
                                <DeleteAction
                                  id={deleteId}
                                  connection={connection}
                                  text='Delete'
                                  showConfirmation={() => setDeleteId(connection.ID)}
                                  onConfirm={runDeletion}
                                  onCancel={(e) => setDeleteId(false)}
                                  isDisabled={isRunningDelete || isDeletingConnection}
                                  isLoading={isRunningDelete || isDeletingConnection}
                                >
                                  <DeleteConfirmationMessage title={`DELETE "${connection.name}"`} />
                                </DeleteAction>
                              )}
                              {/* <a
                                href='#'
                                data-provider={connection.id}
                                className='table-action-link actions-link'
                                onClick={() => runCollection(connection)}
                              >
                                <Icon icon='refresh' size={12} />
                                Collect
                              </a> */}
                              {/* <a
                                href='#'
                                data-provider={connection.id}
                                className='table-action-link actions-link'
                                onClick={() => testConnection(connection)}
                              >
                                <Icon icon='data-connection' size={12} />
                                Test
                              </a> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {maxConnectionsExceeded(sourceLimits[activeProvider.id], connections.length) && (
                      <p style={{ margin: 0, padding: '10px', backgroundColor: '#f0f0f0', borderTop: '1px solid #cccccc' }}>
                        <Icon icon='warning-sign' size='16' color={Colors.GRAY1} style={{ marginRight: '5px' }} />
                        You have reached the maximum number of allowed connections for this provider.
                      </p>
                    )}
                  </Card>
                  <p style={{
                    textAlign: 'right',
                    margin: '12px 6px',
                    fontSize: '10px',
                    color: '#aaaaaa'
                  }}
                  >Fetched <strong>{connections.length}</strong> connection(s) from Lake API for <strong>{activeProvider.name}</strong>
                  </p>
                </>
              )}
            </div>
          </main>
        </Content>
      </div>
    </>
  )
}
