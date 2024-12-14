const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	context: path.resolve(__dirname, "src"),
	entry: {
		main: "./Entrance/index.tsx",
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "js/[name].bundle.js",
		publicPath: "/",
	},
	devtool: "source-map",
	mode: "development",
	devServer: {
		static: {
			directory: path.resolve(__dirname, "dist"),
		},
		port: 3000,
		open: true,
		hot: true,
		historyApiFallback: true,
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
		extensions: [".tsx", ".ts", ".jsx", ".js"],
		fallback: {
			fs: false,
			path: require.resolve("path-browserify"),
			os: require.resolve("os-browserify/browser"),
			stream: require.resolve("stream-browserify"),
			child_process: false,
		},
	},
	module: {
		rules: [
			{
				test: /\.(png|jpg|jpeg|gif|webp)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/[name][ext]",
				},
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env", "@babel/preset-react"],
					},
				},
			},
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							url: true,
						},
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							url: false,
						},
					},
					"sass-loader",
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
				generator: {
					filename: "assets/fonts/[name][ext]",
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "assets/css/index.css",
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, "src/index.html"),
			filename: "index.html",
			inject: false,
		}),
		new webpack.IgnorePlugin({
			resourceRegExp: /^(canvas|electron\/common|sharp)$/,
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "Quest Data", to: "Quest Data" },
				{ from: "Images", to: "Images" },
				{ from: "Quests", to: "Quests" },
				{ from: "Rewards", to: "Rewards" },
			],
		}),
	],
	externals: {
		sharp: "commonjs sharp",
	},
};
