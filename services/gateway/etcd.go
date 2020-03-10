package main

import (
	"go.etcd.io/etcd/clientv3"
	"time"
	"fmt"
	// "context"
)

func etcd() {
  cli, err := clientv3.New(clientv3.Config{
    Endpoints:   []string{"localhost:2379"},
    DialTimeout: 5 * time.Second,
  })
  if err != nil {
    fmt.Println("connect failed, err:", err)
    return
  }

  fmt.Println("connect succ")
  defer cli.Close()
}

func main() {
  etcd()
}
