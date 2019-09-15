import React, { Component } from 'react';
import { Table, Button } from 'antd';
import { connect } from 'dva';
import { StateType } from './model';
import { Dispatch } from 'redux';
import _get from 'lodash/get';
import CreateDeploy from './components/modals/CreateDeploy';
import { DeployVersionType } from './data';
import { ColumnProps } from 'antd/es/table/interface';

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
    deployPanel: StateType;
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
    createDeployVisible: false,
  };

  componentDidMount() {
    this.fetchDeploy(1);
  }

  fetchDeploy(page: number) {
    const { dispatch } = this.props;
    dispatch({
      type: 'deployPanel/fetch',
      page,
    });
  }

  createDeploy = () => {
    this.setState({ createDeployVisible: true });
  };

  renderModal() {
    const { createDeployVisible } = this.state;

    return (
      <div>
        <CreateDeploy
          visible={createDeployVisible}
          onCreate={() => {
            this.setState({ createDeployVisible: false });
            this.fetchDeploy(1);
          }}
          onClose={() => this.setState({ createDeployVisible: false })}
        />
      </div>
    );
  }

  renderTable() {
    const { loading, deployPanel } = this.props;

    const columns: Array<ColumnProps<DeployVersionType>> = [
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
        title: '下载地址',
        dataIndex: 'download_url',
        key: 'download_url',
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
        render: (_, record) => (
          <span>
            <a href="javascript:;">删除</a>
          </span>
        ),
      },
    ];

    const data = deployPanel.deploys || [];

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
    return (
      <div>
        <p style={{ textAlign: 'center' }}>部署列表</p>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={this.createDeploy}>
            创建部署记录
          </Button>
        </div>
        {this.renderTable()}
        {this.renderModal()}
      </div>
    );
  }
}

export default Notify;
