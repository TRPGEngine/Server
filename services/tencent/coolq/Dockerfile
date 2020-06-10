FROM golang

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc-mingw-w64-i686 \
    && rm -rf /var/lib/apt/lists/* \
    && rm /usr/bin/gcc \
    && ln -s /usr/bin/i686-w64-mingw32-gcc /usr/bin/gcc

# install cqcfg and generate app.json
RUN /usr/local/go/bin/go get github.com/Tnze/CoolQ-Golang-SDK/tools/cqcfg

ENV CGO_LDFLAGS=-Wl,--kill-at \
    CGO_ENABLED=1 \
    GOOS=windows \
    GOARCH=386

WORKDIR /home
CMD /usr/local/go/bin/go build -ldflags '-s -w -extldflags "-static"' -buildmode=c-shared -o app.dll && \
    /usr/local/go/bin/go generate
