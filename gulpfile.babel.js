// =====================================
// 前提知識
// =====================================

/*
import～という書き方はES6仕様の書き方
ES6仕様で書く場合、gulpfile名をgulpfile.babel.jsという名前にする必要がある
import文はES6に対応していないブラウザでは動かない
そのためwebpackなどのモジュールバンドルツールを利用する
*/

// gulpのメソッドの説明=========================
// src コンパイルする参照元を指定
// dest 出力先のディレクトリを指定
// watch ファイルを監視して変更があればタスクを走らせる
// series 直列処理(順番に処理してくれる) parallelというものもあるがそれは並列処理

import { src, dest, watch, series } from 'gulp';

// webpack.config.jsの読み込み
import webpackConfig from './webpack.config.js';

// webpackをgulpで使う為の読み込み
import webpack from 'webpack-stream';

// ファイル変更を監視して、変更を即座にブラウザに反映させるモジュール読み込み
import browserSync from 'browser-sync';

// エラーが出たら通知を出すモジュール読み込み
import notify from 'gulp-notify';

// Stream中に起こるエラーが原因でタスクが強制停止することを防止するモジュール読み込み
// watch中にエラーが発生するとwatch自体が停止してしまうため
import plumber from 'gulp-plumber';

//参照元パス
const srcPath = {
  js: 'src/js/**/**.js', // srcディレクトリ内のディレクトリ/.jsがつくファイルを参照元に指定
};

//出力先パス
const destPath = {
  js: 'dist/js/', // コンパイル後に出力する場所をdist/js/に指定
};

// jsファイル用のタスク作成
function jsTask() {
  return src(srcPath.js) // コンパイルしたいファイル
    .pipe(
      plumber(
        // エラーが出ても処理を止めない
        {
          errorHandler: notify.onError({
            title: 'Error...',
            message: '<%= error.message %>',
          }), //エラー出力設定
        }
      )
    )
    .pipe(webpack(webpackConfig))
    .pipe(dest(destPath.js)) // コンパイルしたファイルを出力する場所を指定
    .pipe(browserSync.stream());
}

// ファイルを監視するタスク作成
function watchTask() {
  // browserSyncの初期化
  browserSync.init({
    // サーバーの設定
    server: {
      baseDir: './', // 対象ディレクトリ
      index: 'index.html', //indexファイル名
    },
  });
  // 第一引数でwatchの対象、第二引数でwatchをいつするかを指定

  // 指定したファイルが変更されたらリロードする
  watch('./*.html').on('change', browserSync.reload);
  watch('./dist/*/*.+(js|css)').on('change', browserSync.reload);
  watch('./dist/*/*/*.+(js|css)').on('change', browserSync.reload);

  watch(srcPath.js, jsTask);
}

// Default task
exports.default = series(jsTask, watchTask);
