import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import request from '@/utils/request';
import debounce from 'lodash/debounce';
import { LabeledValue } from 'antd/es/select';
const Option = Select.Option;

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
}

interface State {
  data: any[];
  value: LabeledValue[];
  fetching: boolean;
}

class UserPicker extends Component<Props, State> {
  lastFetchId = 0;
  state: Readonly<State> = {
    data: [],
    value: [],
    fetching: false,
  };

  fetchUser = debounce(async (word) => {
    // tslint:disable-next-line: no-console
    console.log('fetching user', word);
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ data: [], fetching: true });
    const ret = await request.get(
      `/dashboard/api/v2/player/search/fuzzy?word=${word}`
    );

    if (fetchId !== this.lastFetchId) {
      // 请求时序控制, 仅处理最后一次获取到的数据
      return;
    }
    if (ret.result === false) {
      return;
    }

    const data = ret.list.map((user: any) => ({
      text: `#${user.id} ${user.name}`,
      value: user.id,
    }));
    this.setState({ data, fetching: false });
  }, 200);

  handleChange = (value: LabeledValue[]) => {
    this.setState({
      data: [],
      value,
      fetching: false,
    });
    this.props.onChange(value.map((v) => Number(v.key)));
  };

  render() {
    const { data, value, fetching } = this.state;
    const selectedValue = value.filter((v) =>
      this.props.value.includes(Number(v.key))
    );

    return (
      <Select
        mode="multiple"
        labelInValue={true}
        value={selectedValue}
        placeholder="选择角色"
        notFoundContent={fetching ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchUser}
        onChange={this.handleChange}
        style={{ width: '100%' }}
      >
        {data.map((d: any) => (
          <Option key={d.value} value={d.value}>
            {d.text}
          </Option>
        ))}
      </Select>
    );
  }
}

export default UserPicker;
