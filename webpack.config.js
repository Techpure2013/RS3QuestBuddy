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
		filename: "js/[name].[contenthash].bundle.js",
		chunkFilename: "js/[name].[contenthash].chunk.js", // Added for code splitting
		publicPath: "./",
		clean: true, // Cleans dist folder before each build
	},
	devtool: "source-map",
	mode: "development",
	devServer: {
		static: {
			directory: path.resolve(__dirname, "dist"),
		},
		port: 3001,
		open: true,
		hot: true,
		historyApiFallback: true,
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
		extensions: [".tsx", ".ts", ".jsx", ".js", ".json"], // Added .json
		fallback: {
			fs: false,
			path: require.resolve("path-browserify"),
			os: require.resolve("os-browserify/browser"),
			stream: require.resolve("stream-browserify"),
			child_process: false,
		},
	},
	optimization: {
		splitChunks: {
			chunks: "all",
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					priority: 10,
				},
				common: {
					minChunks: 2,
					priority: 5,
					reuseExistingChunk: true,
				},
			},
		},
		runtimeChunk: "single", // Separates webpack runtime code
	},
	module: {
		rules: [
			{
				test: /\.(png|jpg|jpeg|gif|webp)$/i,
				type: "asset/resource",
				generator: {
					filename: "./assets/[name][ext]",
				},
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							[
								"@babel/preset-env",
								{
									modules: false, // Important: Preserves ES modules
									targets: {
										browsers: [">0.25%", "not dead"],
									},
								},
							],
							"@babel/preset-react",
						],
						plugins: [
							"@babel/plugin-syntax-dynamic-import", // Enables dynamic imports
						],
					},
				},
			},
			{
				test: /\.tsx?$/,
				use: {
					loader: "ts-loader",
					options: {
						transpileOnly: true, // Faster builds during development
					},
				},
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							url: false,
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
							url: true,
						},
					},
					"sass-loader",
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: "asset/resource",
				generator: {
					filename: "./assets/fonts/[name][ext]",
				},
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "assets/css/[name].[contenthash].css",
			chunkFilename: "assets/css/[name].[contenthash].chunk.css",
		}),
		new HtmlWebpackPlugin({
			template: "./Entrance/index.html",
			filename: "index.html",
			inject: true,
		}),
		new webpack.IgnorePlugin({
			resourceRegExp: /^(canvas|electron\/common|sharp)$/,
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "public", to: "." },
				{ from: "Quest Data", to: "Quest Data" },
				{ from: "Images", to: "Images" },
				{ from: "Quests", to: "Quests" },
				{ from: "assets", to: "assets" },
				{ from: "appconfig.prod.json", to: "appconfig.prod.json" },
			],
		}),
	],
	externals: {
		sharp: "commonjs sharp",
	},
};
