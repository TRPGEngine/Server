#!/bin/bash -e

# * 为必改项
# * 更换为你自己的域名
echo 'Please input your cert domain (e.g.demo.rancher.com)'
read CN
# CN='' # 例如: demo.rancher.com

# 扩展信任IP或域名
## 一般ssl证书只信任域名的访问请求，有时候需要使用ip去访问server，那么需要给ssl证书添加扩展IP，
## 多个IP用逗号隔开。如果想多个域名访问，则添加扩展域名（SSL_DNS）,多个SSL_DNS用逗号隔开
SSL_IP='' # 例如: 1.2.3.4
SSL_DNS='' # 例如: demo.rancher.com

# 国家名(2个字母的代号)
C=CN

# 证书加密位数
SSL_SIZE=2048

# 证书有效期
DATE=${DATE:-3650}

# 配置文件
SSL_CONFIG='openssl.cnf'

if [[ -z $SILENT ]]; then
echo "----------------------------"
echo "| SSL Cert Generator |"
echo "----------------------------"
echo
fi

export CA_KEY=${CA_KEY-"cakey.pem"}
export CA_CERT=${CA_CERT-"cacerts.pem"}
export CA_SUBJECT=ca-$CN
export CA_EXPIRE=${DATE}

export SSL_CONFIG=${SSL_CONFIG}
export SSL_KEY=$CN.key
export SSL_CSR=$CN.csr
export SSL_CERT=$CN.crt
export SSL_EXPIRE=${DATE}

export SSL_SUBJECT=${CN}
export SSL_DNS=${SSL_DNS}
export SSL_IP=${SSL_IP}

export K8S_SECRET_COMBINE_CA=${K8S_SECRET_COMBINE_CA:-'true'}

[[ -z $SILENT ]] && echo "--> Certificate Authority"

if [[ -e ./${CA_KEY} ]]; then
    [[ -z $SILENT ]] && echo "====> Using existing CA Key ${CA_KEY}"
else
    [[ -z $SILENT ]] && echo "====> Generating new CA key ${CA_KEY}"
    openssl genrsa -out ${CA_KEY} ${SSL_SIZE} > /dev/null
fi

if [[ -e ./${CA_CERT} ]]; then
    [[ -z $SILENT ]] && echo "====> Using existing CA Certificate ${CA_CERT}"
else
    [[ -z $SILENT ]] && echo "====> Generating new CA Certificate ${CA_CERT}"
    openssl req -x509 -sha256 -new -nodes -key ${CA_KEY} \
    -days ${CA_EXPIRE} -out ${CA_CERT} -subj "/CN=${CA_SUBJECT}" > /dev/null || exit 1
fi

echo "====> Generating new config file ${SSL_CONFIG}"
cat > ${SSL_CONFIG} <<EOM
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name
[req_distinguished_name]
[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, serverAuth
EOM

if [[ -n ${SSL_DNS} || -n ${SSL_IP} ]]; then
    cat >> ${SSL_CONFIG} <<EOM
subjectAltName = @alt_names
[alt_names]
EOM
    IFS=","
    dns=(${SSL_DNS})
    dns+=(${SSL_SUBJECT})
    for i in "${!dns[@]}"; do
      echo DNS.$((i+1)) = ${dns[$i]} >> ${SSL_CONFIG}
    done

    if [[ -n ${SSL_IP} ]]; then
        ip=(${SSL_IP})
        for i in "${!ip[@]}"; do
          echo IP.$((i+1)) = ${ip[$i]} >> ${SSL_CONFIG}
        done
    fi
fi

[[ -z $SILENT ]] && echo "====> Generating new SSL KEY ${SSL_KEY}"
openssl genrsa -out ${SSL_KEY} ${SSL_SIZE} > /dev/null || exit 1

[[ -z $SILENT ]] && echo "====> Generating new SSL CSR ${SSL_CSR}"
openssl req -sha256 -new -key ${SSL_KEY} -out ${SSL_CSR} \
-subj "/CN=${SSL_SUBJECT}" -config ${SSL_CONFIG} > /dev/null || exit 1

[[ -z $SILENT ]] && echo "====> Generating new SSL CERT ${SSL_CERT}"
openssl x509 -sha256 -req -in ${SSL_CSR} -CA ${CA_CERT} \
    -CAkey ${CA_KEY} -CAcreateserial -out ${SSL_CERT} \
    -days ${SSL_EXPIRE} -extensions v3_req \
    -extfile ${SSL_CONFIG} > /dev/null || exit 1

if [[ -z $SILENT ]]; then
echo "====> Complete"
echo "keys can be found in volume mapped to $(pwd)"
echo
echo "====> Output results as YAML"
echo "---"
echo "ca_key: |"
cat $CA_KEY | sed 's/^/  /'
echo
echo "ca_cert: |"
cat $CA_CERT | sed 's/^/  /'
echo
echo "ssl_key: |"
cat $SSL_KEY | sed 's/^/  /'
echo
echo "ssl_csr: |"
cat $SSL_CSR | sed 's/^/  /'
echo
echo "ssl_cert: |"
cat $SSL_CERT | sed 's/^/  /'
echo
fi

if [[ -n $K8S_SECRET_NAME ]]; then

  if [[ -n $K8S_SECRET_COMBINE_CA ]]; then
    [[ -z $SILENT ]] && echo "====> Adding CA to Cert file"
    cat ${CA_CERT} >> ${SSL_CERT}
  fi

  [[ -z $SILENT ]] && echo "====> Creating Kubernetes secret: $K8S_SECRET_NAME"
  kubectl delete secret $K8S_SECRET_NAME --ignore-not-found

  if [[ -n $K8S_SECRET_SEPARATE_CA ]]; then
    kubectl create secret generic \
    $K8S_SECRET_NAME \
    --from-file="tls.crt=${SSL_CERT}" \
    --from-file="tls.key=${SSL_KEY}" \
    --from-file="ca.crt=${CA_CERT}"
  else
    kubectl create secret tls \
    $K8S_SECRET_NAME \
    --cert=${SSL_CERT} \
    --key=${SSL_KEY}
  fi

  if [[ -n $K8S_SECRET_LABELS ]]; then
    [[ -z $SILENT ]] && echo "====> Labeling Kubernetes secret"
    IFS=$' \n\t' # We have to reset IFS or label secret will misbehave on some systems
    kubectl label secret \
      $K8S_SECRET_NAME \
      $K8S_SECRET_LABELS
  fi
fi

echo "4. 重命名服务证书"
mv ${CN}.key tls.key
mv ${CN}.crt tls.crt
echo "成功"

# 以下为项目专属
echo "5. 重命名至默认名"
mv tls.key privkey.pem
mv tls.crt fullchain.pem
echo "成功"

echo "创建证书完毕"
