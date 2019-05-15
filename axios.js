import axios from 'axios'
import {Message} from 'iview'

let util = {};
axios.defaults.withCredentials = true;


util.ajax = axios.create({
  // baseURL: ajaxUrl,
  timeout: 120000,
  withCredentials: true
});

axios.interceptors.request.use(
  config => {
    config.headers = {
      'Content-Type':'application/json'
    };
    return config;
  },
  error => {
    return Promise.reject(error)
  }
);

util.request = function (options) {
  axios.request({
    // baseURL: ajaxUrl,
    withCredentials: true,
    method: options.method || 'post',
    url: `${options.url}`,
    headers: {'X-Requested-With': 'XMLHttpRequest'},
    params: options.params,
    data: options.data,
    transformRequest: [function (data) {
      // 这里可以在发送请求之前对请求数据做处理，比如form-data格式化等，这里可以使用开头引入的Qs（这个模块在安装axios的时候就已经安装了，不需要另外安装）
      if (null !== data && '' !== data && typeof(data) !== 'undefined') {
        data = JSON.stringify(data)
      }
      return data
    }],
    timeout: options.timeout || 120 * 1000
  }).then(function (response) {
    // 登陆成功
    let responseData = response.data;
    options.success && options.success(responseData)
  }).catch(function (error) {
    let response = error.response;
    let errorData = '';
    if (null !== response && '' !== response && typeof(response) !== 'undefined') {
      errorData = error.response.data;
      let code = response.status;
      if (code === 401) {
        Message.error('登陆会话超时，请重新登录！');
        options.error && options.error(error);
        setTimeout(jumpLogin, 2000);
      } else if (code === 504) {
        Message.error('服务器未连接，请重新登录！');
        options.error && options.error(error);
        setTimeout(jumpLogin, 2000);
      } else {
        if (null !== errorData && '' !== errorData && typeof(errorData) !== 'undefined') {
          let msg = errorData.list;
          if (null !== msg && '' !== msg && typeof(msg) !== 'undefined') {
            Message.error(msg);
          } else {
            Message.error('请求异常');
          }
        } else {
          Message.error('请求异常');
        }
        options.error && options.error(error)
      }
    }
  })

};


export default util
