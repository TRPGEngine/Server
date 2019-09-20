import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { WrappedFormUtils } from 'antd/es/form/Form';
import semver from 'semver';
import _isNull from 'lodash/isNull';
import { createDeploy } from '../../service';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

interface Props {
  visible: boolean;
  form: WrappedFormUtils;
  onCreate: () => void;
  onClose: () => void;
}
const CreateDeploy = (props: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { visible, onCreate, onClose, form } = props;
  const { getFieldDecorator } = form;

  const onSubmit = () => {
    form.validateFields((errors, values) => {
      if (_isNull(errors)) {
        // 没有错误
        setIsLoading(true);
        createDeploy({ ...values })
          .then((ret) => {
            setIsLoading(false);
            if (ret.result === false) {
              message.error(ret.message);
              return;
            }

            form.resetFields();
            onCreate();
          })
          .catch((err) => console.error(err));
      }
    });
  };

  return (
    <Modal
      title="创建部署"
      visible={visible}
      onCancel={onClose}
      onOk={onSubmit}
      okButtonProps={{
        loading: isLoading,
      }}
    >
      <Form {...formItemLayout}>
        <FormItem label="版本号">
          {getFieldDecorator('version', {
            rules: [
              { required: true, message: '请输入内容!' },
              {
                validator: (rule, value, callback) => {
                  return !_isNull(semver.valid(value));
                },
                message: '请输入符合semver规范的内容',
              },
            ],
          })(<Input placeholder="通知" />)}
        </FormItem>
        <FormItem label="平台">
          {getFieldDecorator('platform', {
            rules: [{ required: true, message: '请输入内容!' }],
          })(
            <Select>
              <Option value="android">Android</Option>
              <Option value="ios">iOS</Option>
              <Option value="windows">Windows</Option>
              <Option value="mac">Mac</Option>
              <Option value="linux">Linux</Option>
            </Select>
          )}
        </FormItem>
        <FormItem label="下载链接">
          {getFieldDecorator('downloadUrl', {
            rules: [{ required: true, message: '请输入内容!' }],
          })(<Input placeholder="下载链接" />)}
        </FormItem>
        <FormItem label="版本描述">
          {getFieldDecorator('describe', {
            rules: [{ required: true, message: '请输入内容!' }],
          })(
            <TextArea
              placeholder="内容"
              autosize={{ minRows: 4, maxRows: 6 }}
            />
          )}
        </FormItem>
      </Form>
    </Modal>
  );
};

export default Form.create<Props>({ name: 'create-deploy' })(CreateDeploy);
