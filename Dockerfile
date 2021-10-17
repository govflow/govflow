FROM node:16.10.0-bullseye as compile-image

RUN apt-get update && apt-get install -y --no-install-recommends make build-essential gcc libpq-dev git locales-all

ENV LC_ALL=en_US.UTF-8
ENV LC_TYPE=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV CODE_DIR=/srv/code

WORKDIR $CODE_DIR
COPY . .
RUN make install

FROM node:16.10.0-bullseye as build-image

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client make gettext locales locales-all

ENV LC_ALL=en_US.UTF-8
ENV LC_TYPE=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV CODE_DIR=/srv/code

COPY --from=compile-image $CODE_DIR $CODE_DIR
WORKDIR $CODE_DIR

EXPOSE 3000

CMD make serve
