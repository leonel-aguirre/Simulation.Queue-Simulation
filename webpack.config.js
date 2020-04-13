module.exports = {
  resolve: {
    extensions: [".js"]
  },
  context: __dirname,
  entry: {
    app: ["./src/index.js", "./src/style.css"]
  },
  output: {
    path:
      "C:\\Users\\Leonel\\Desktop\\Simulation Queue\\queues simulation\\build",
    filename: "app.js",
    publicPath: "/build/"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  devServer: {
    port: 8081,
    inline: true
  }
};
