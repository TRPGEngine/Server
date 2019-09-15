import React, { useState } from 'react';
import { Modal, Form, Input, Icon, Checkbox, message } from 'antd';
import { WrappedFormUtils } from 'antd/es/form/Form';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
import _isNull from 'lodash/isNull';
import { sendNotify } from '../../service';

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
  registrationId: string;
  form: WrappedFormUtils;
  onClose: () => void;
}
const SendNotify = (props: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { visible, onClose, registrationId, form } = props;

  const { getFieldDecorator } = form;

  const onSubmit = () => {
    form.validateFields((errors, values) => {
      if (_isNull(errors)) {
        // 没有错误
        setIsLoading(true);
        sendNotify({ ...values, registrationId })
          .then((ret) => {
            setIsLoading(false);
            if (ret.result === false) {
              message.error(ret.message);
              return;
            }

            form.resetFields();
            onClose();
          })
          .catch((err) => console.error(err));
      }
    });

    // console.log(form.getFieldsValue());
  };

  return (
    <Modal
      title="发送通知"
      visible={visible}
      onCancel={onClose}
      onOk={onSubmit}
      okButtonProps={{
        loading: isLoading,
      }}
    >
      <Form {...formItemLayout}>
        <FormItem label="标题">
          {getFieldDecorator('title', {})(<Input placeholder="通知" />)}
        </FormItem>
        <FormItem label="内容">
          {getFieldDecorator('content', {
            rules: [{ required: true, message: '请输入内容!' }],
          })(<TextArea placeholder="内容" />)}
        </FormItem>
        <FormItem
          wrapperCol={{
            xs: {
              span: 24,
              offset: 0,
            },
            sm: {
              span: 18,
              offset: 6,
            },
          }}
        >
          {getFieldDecorator('mipush', {
            valuePropName: 'checked',
          })(<Checkbox>离线使用厂商渠道</Checkbox>)}
        </FormItem>
      </Form>
    </Modal>
  );
};

export default Form.create<Props>({ name: 'send-notify' })(SendNotify);
