import React from 'react';
import { Modal, Form, Input, Icon } from 'antd';
import { WrappedFormUtils } from 'antd/es/form/Form';
const FormItem = Form.Item;
const TextArea = Input.TextArea;

interface Props {
  visible: boolean;
  registrationId: string;
  form: WrappedFormUtils;
  onClose: () => void;
}

const SendNotify = (props: Props) => {
  const { visible, onClose, registrationId, form } = props;

  const { getFieldDecorator } = form;
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  const onSubmit = () => {
    console.log(form.getFieldsValue());
  };

  return (
    <Modal
      title="发送通知"
      visible={visible}
      onCancel={onClose}
      onOk={onSubmit}
    >
      <Form {...formItemLayout}>
        <FormItem label="任务描述">
          {getFieldDecorator('taskdesc', {
            rules: [{ required: true, message: '请输入任务描述!' }],
          })(
            <Input
              // prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="任务描述"
            />
          )}
        </FormItem>
        <FormItem label="标题">
          {getFieldDecorator('title', {
            rules: [{ required: true, message: '请输入标题!' }],
          })(<Input placeholder="标题" />)}
        </FormItem>
        <FormItem label="内容">
          {getFieldDecorator('content', {
            rules: [{ required: true, message: '请输入内容!' }],
          })(<TextArea placeholder="内容" />)}
        </FormItem>
      </Form>
    </Modal>
  );
};

export default Form.create<Props>({ name: 'send-notify' })(SendNotify);
