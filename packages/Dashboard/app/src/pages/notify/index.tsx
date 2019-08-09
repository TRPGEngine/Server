import React, { Component } from 'react';
import { Table, Divider, Tag } from 'antd';
import { connect } from 'dva';
import { StateType } from './model';
import { Dispatch } from 'redux';
import _get from 'lodash/get';

interface Props {
  notifyPanel: StateType;
  dispatch: Dispatch<any>;
  loading: boolean;
}

@connect(
  ({
    notifyPanel,
    loading,
  }: {
    notifyPanel: any;
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    notifyPanel,
    loading: loading.effects['notifyPanel/fetch'],
  })
)
class Notify extends Component<Props> {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'notifyPanel/fetch',
    });
  }

  renderTable() {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '设备标识',
        dataIndex: 'registration_id',
        key: 'registration_id',
      },
      {
        title: '用户UUID',
        dataIndex: 'user_uuid',
        key: 'user_uuid',
      },
      {
        title: '用户标签',
        key: 'user_tags',
        dataIndex: 'user_tags',
        render: (tags: string[]) => (
          <span>
            {tags.map((tag) => {
              let color = tag.length > 5 ? 'geekblue' : 'green';
              if (tag === 'loser') {
                color = 'volcano';
              }
              return (
                <Tag color={color} key={tag}>
                  {tag}
                </Tag>
              );
            })}
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: (_: any, record: {}) => (
          <span>
            <a href="javascript:;">发送通知</a>
            <Divider type="vertical" />
            <a href="javascript:;">查看历史</a>
          </span>
        ),
      },
    ];

    const data = _get(this.props, 'notifyPanel.devices', []);

    return <Table columns={columns} dataSource={data} />;
  }

  render() {
    const { notifyPanel } = this.props;
    const { devices } = notifyPanel;

    return (
      <div>
        <p style={{ textAlign: 'center' }}>通知配置</p>
        <p style={{ textAlign: 'center' }}>{JSON.stringify(devices)}</p>
        {this.renderTable()}
      </div>
    );
  }
}

export default Notify;
