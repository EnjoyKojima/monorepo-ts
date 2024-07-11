FROM oven/bun

WORKDIR /var/www/html

# システムの更新とパッケージのインストール
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        git \
        curl \
        unzip \
        openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

CMD ["/bin/bash"]