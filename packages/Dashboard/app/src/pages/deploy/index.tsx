import React, { Component } from 'react';
import { Table, Divider, Tag } from 'antd';
import { connect } from 'dva';
import { StateType } from './model';
import { Dispatch } from 'redux';
import _get from 'lodash/get';
// import SendNotify from './components/modals/SendNotify';

interface Props {
  deployPanel: StateType;
  dispatch: Dispatch<any>;
  loading: boolean;
}

@connect(
  ({
    deployPanel,
    loading,
  }: {
    deployPanel: any;
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    deployPanel,
    loading: loading.effects['deployPanel/fetch'],
  })
)
class Notify extends Component<Props> {
  state = {
    sendNotifyVisible: false,
    selectedRegistrationId: '',
  };

  componentDidMount() {
    this.fetchDevices(1);
  }

  fetchDevices(page: number) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deployPanel/fetch',
      page,
    });
  }

  // renderModal() {
  //   const { sendNotifyVisible, selectedRegistrationId } = this.state;

  //   return (
  //     <div>
  //       <SendNotify
  //         visible={sendNotifyVisible}
  //         registrationId={selectedRegistrationId}
  //         onClose={() => this.setState({ sendNotifyVisible: false })}
  //       />
  //     </div>
  //   );
  // }

  renderTable() {
    const { loading, deployPanel } = this.props;

    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
      },
      {
        title: '平台',
        dataIndex: 'platform',
        key: 'platform',
      },
      {
        title: '描述',
        dataIndex: 'describe',
        key: 'describe',
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: any, record: any) => (
          <span>
            <a
              href="javascript:;"
              onClick={() =>
                this.setState({
                  sendNotifyVisible: true,
                  selectedRegistrationId: record.registration_id,
                })
              }
            >
              发送通知
            </a>
            <Divider type="vertical" />
            <a href="javascript:;">查看历史</a>
          </span>
        ),
      },
    ];

    const data = deployPanel.versions || [];

    return (
      <Table
        rowKey="id"
        loading={loading}
        pagination={false}
        columns={columns}
        dataSource={data}
      />
    );
  }

  render() {
    const { deployPanel } = this.props;
    const { versions } = deployPanel;

    return (
      <div>
        <p style={{ textAlign: 'center' }}>部署列表</p>
        {this.renderTable()}
        {/* {this.renderModal()} */}
      </div>
    );
  }
}

export default Notify;
