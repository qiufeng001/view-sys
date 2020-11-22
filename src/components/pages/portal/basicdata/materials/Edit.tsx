import React from 'react';
import { Form, Input, Select, Upload, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../../../../../static/style/framework/Edit.css';
import axios from 'axios';
import baseUrl from "../../../../../api/baseUrl";
const { TextArea } = Input;
const menuUrl = baseUrl.portal.portal + "/materials/";

interface IProps {
    opts: Array<any>;
    title: string;
    params: Array<string>;
    id: string;
    name: string;
    attribute: string;
    efficacy: string;
    instructions: string;
    previewVisible: boolean;
    previewImage: string;
    previewTitle: string;
    fileList: Array<any>;
}

const { Option } = Select;


const layout = {
    labelCol: {
        span: 8,
    },
    wrapperCol: {
        span: 16,
    },
};

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


class Edit extends React.Component<any, IProps> {
    name: any
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
            opts: [],
            title: "新增",
            params: this.props.params,
            id: "",
            name: "",
            attribute: "",
            efficacy: "",
            instructions: "",
            previewVisible: false,
            previewImage: '',
            previewTitle: '',
            fileList: []
        };
    }

    componentDidMount = () => {
        var params = this.state.params;
        if (params != undefined && params.length > 0) {
            this.setState({ title: "修改" });
            // 读取数据
            axios.get(`${menuUrl}` + this.state.params[0]).then(res => {
                const data = res.data;
                this.setState({
                    id: data.id,
                    name: data.name,
                    attribute: data.attribut,
                    efficacy: data.efficacy,
                    instructions: data.instructions
                });
                var files = data.files;
                if (files !== null) {
                    var fileList = [{}];
                    fileList = [];
                    var uid = -1;
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var fileObj = {
                            "name": file.name,
                            "uid": uid,
                            "thumbUrl": file.thumbUrl,
                            "type": "images/" + file.type
                        };
                        uid--;
                        fileList.push(fileObj);
                    }
                    this.setState({ fileList: fileList });
                }
            }).catch(err => {
                alert("系统出错！请联系管理员！")
            });
        } else {
            this.setState({ title: "新增" })
        }
    }

    /** 后退 */
    backExecute = () => {
        this.props.backExecute(this.props.params);
    }

    /**输入框事件 */
    handleChange = (name, event) => {
        const newState = {};
        const value = event.target.value;
        newState[name] = value;
        this.setState(newState);
    };

    // 重置
    reset = (e: React.FormEvent) => {
        this.setState({ name: "", attribute: "", efficacy: "", instructions: "" });
    }

    submit = (e: React.FormEvent) => {
        var urlType = this.state.id == "" ? "createByJson" : "updateByJson";
        var url = `${menuUrl}` + urlType;
        var files = [{}];
        files = [];
        var fileList = this.state.fileList;
        for (var i = 0; i < fileList.length; i++) {
            var fileObject = fileList[i];
            var file = {
                "name": fileObject.name,
                "size": fileObject.size,
                "type": fileObject.type,
                "thumbUrl": fileObject.thumbUrl
            }
            files.push(file);
        }

        var menu = {
            id: this.state.id,
            name: this.state.name,
            attribute: this.state.attribute,
            efficacy: this.state.efficacy,
            instructions: this.state.instructions,
            files: files
        };

        var data = JSON.stringify(menu);
        axios({
            method: "post",
            url: url,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            data: data
        }).then((res) => {
            this.props.resFun("success");
        }).catch(err => {
            this.props.resFun("failed");
        });

    }

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if(file.lastModified !== undefined) {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj);
            }
    
            this.setState({
                previewImage: file.url || file.preview,
                previewVisible: true,
                previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
            });
        }else{
            file.preview = file.thumbUrl;
            this.setState({
                previewImage: file.thumbUrl,
                previewVisible: true,
                previewTitle: file.name || file.url.substring(file.thumbUrl.lastIndexOf('/') + 1),
            });
        }
        
    };

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        const {name} = this.state;
        const changeUpload = ({ fileList: newFileList }) => {
            this.setState({ fileList: newFileList });
        };

        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        );

        return (
            
            <div className="bs-table-main">
                <div className="formHeader">
                    <div className="titleDiv">材料{this.state.title}</div>
                    <div className="backDiv">
                        <button onClick={this.backExecute}>返回</button>
                    </div>
                    <hr />
                    <Form {...layout} name="material-form">
                        <div className="editForm">
                            <div style={{width: '100%', marginBottom: 4}}>
                                <label style={{width: '40%'}}>名称：</label>
                                <Input value={name} name="name" onChange={this.handleChange.bind(this, "name")} required style={{width: '60%'}}/>
                            </div>
                            <div style={{width: '100%', marginBottom: 4}}>
                                <label style={{width: '40%'}}>名称：</label>
                                <TextArea name="attribute" value={this.state.attribute} onChange={this.handleChange.bind(this, "attribute")} />
                            </div>
                            <Form.Item name="attribute" label="属性">
                                <TextArea value={this.state.attribute} onChange={this.handleChange.bind(this, "attribute")} />
                            </Form.Item>
                            <Form.Item name="efficacy" label="功效">
                                <TextArea value={this.state.efficacy} onChange={this.handleChange.bind(this, "efficacy")} />
                            </Form.Item>
                            <Form.Item name="instructions" label="说明">
                                <TextArea value={this.state.instructions} onChange={this.handleChange.bind(this, "instructions")} />
                            </Form.Item>
                            <Form.Item name="materialFile" label="材料图片">
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={this.handlePreview}
                                    onChange={changeUpload}
                                >
                                    {fileList.length >= 3 ? null : uploadButton}
                                </Upload>
                                <Modal
                                    visible={previewVisible}
                                    title={previewTitle}
                                    footer={null}
                                    onCancel={this.handleCancel}
                                >
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </Form.Item>
                            <div className="btn-gp">
                                <button
                                    type="button"
                                    style={{ width: '10%' }}
                                    onClick={this.submit}
                                >
                                    保存
                                </button> &nbsp;
                                <button
                                    type="reset"
                                    style={{ width: '10%' }}
                                    onClick={this.reset}
                                >
                                    重置
                                </button>
                            </div>
                        </div>
                        <br />
                    </Form>
                </div>
            </div>
        )
    }
}

export default Edit;