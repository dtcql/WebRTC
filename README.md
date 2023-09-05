# WebRTC 学习

由于手机，电脑都支持浏览器，用浏览器WebRTC提供的解决方案做在线监考明显优于其他方式，本例利用阿里云来实现一对一的网络视频传输。

## 1. 安装

### 1.1 申请阿里云ECS服务器

### 1.2 在阿里云ECS服务器安装Nignx

源码方式安装Nginx，这样可以添加RTMP模块。

* 安装依赖

install -y libpcre3 libpcre3-dev libssl-dev zlib1g-dev gcc wget unzip vim make curl

* 下载并解压nginx-http-flv-module模块
```
wget https://github.com/winshining/nginx-http-flv-module/archive/master.zip
unzip master.zip
```

* 下载并解压nginx源码
```
wget http://nginx.org/download/nginx-1.17.6.tar.gz
tar -zxvf nginx-1.17.6.tar.gz
```

* 安装nginx并配置https和RTMP模块nginx-http-flv-module
```
./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_stub_status_module  --add-module=../nginx-http-flv-module-master
make && make install
cd /usr/local/nginx/sbin
./nginx
```

* 配置nginx环境变量
```
vim /etc/profile
export NGINX_HOME=/usr/local/nginx
export PATH=$NGINX_HOME/sbin:$PATH
source /etc/profile
```

* 配置nginx conf

/usr/local/nginx/conf/nginx.conf 开启HTTPS服务，SSL证书在阿里云申请。

### 1.3 安装将视频流转码为RTMP的工具ffmpeg
```
sudo rpm -Uvh https://download1.rpmfusion.org/free/el/rpmfusion-free-release-7.noarch.rpm
sudo rpm -Uvh https://download1.rpmfusion.org/nonfree/el/rpmfusion-nonfree-release-7.noarch.rpm
sudo yum install ffmpeg
```

## 2.前端代码

index.html

## 3.后端代码

* 安装pm2
```
npm install pm2 -g
```
常用命令 pm2 start/stop/list/restart/delete/logs

* 安装依赖
```
npm init -y
npm install express,cors等
```