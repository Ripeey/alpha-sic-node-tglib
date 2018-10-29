const query = require('events')
const rurl = require('request');
const http = require('http');
const site = "https://api.telegram.org/bot"
class bot extends query {
	constructor(key, type = 3000, data = null) {
		super();
		this.api = site + key;
		this.update = null;
		type === true ? __initlongpoll(this) : type === false? this.update = data : __initwebhook(this, type)
	}
	//All Api Method Calls
	/**
 	As theres no magic method like php i have used a small trick to reduce work
 	use the first word of of every method and call it
	 like $bot->sendMessage(["chat_id"=>$bot->ChatID(),"text"=>"test"]);
	 will be bot.send('Message',{chat_id:bot.ChatID(),text:'test'});
	 Short Cut methods arent available yet unfortunately but most stuff still working
	 i might change the looks and stuffs of Api Method Call.
	*/
	send(method, params, handle_response) {
		__request(`${this.api}/send${method}`, params, handle_response)
	}
	get(method, params, handle_response) {
		__request(`${this.api}/get${method}`, params, handle_response)
	}
	delete(method, params, handle_response) {
		__request(`${this.api}/delete${method}`, params, handle_response)
	}
	forward(params, handle_response) {
		__request(`${this.api}/forwardMessage`, params, handle_response)
	}
	edit(method, params, handle_response) {
		__request(`${this.api}/edit${method}`, params, handle_response)
	}
	member(method, params, handle_response) {
		__request(`${this.api}/${method}ChatMember`, params, handle_response)
	}
	pin(params, handle_response) {
		__request(`${this.api}/pinChatMessage`, params, handle_response)
	}
	unpin(params, handle_response) {
		__request(`${this.api}/unpinChatMessage`, params, handle_response)
	}
	leave(params, handle_response) {
		__request(`${this.api}/leaveChat`, {
			chat_id: params
		}, handle_response)
	}
	answer(method, params, handle_response) {
		__request(`${this.api}/answer${method}`, params, handle_response)
	}
	set(method, params, handle_response) {
		__request(`${this.api}/set${method}`, params, handle_response)
	}
	uploadSticker(params, handle_response) {
		__request(`${this.api}/uploadStickerFile`, params, handle_response)
	}
	createSticker(params, handle_response) {
		__request(`${this.api}/createNewStickerSet`, params, handle_response)
	}
	addSticker(params, handle_response) {
		__request(`${this.api}/addStickerToSet`, params, handle_response)
	}
	//All Utils
	Text() {
		try {
			return this.update[this.UpdateType()].text;
		}
		catch (err) {
			return null;
		}
	}
	Caption() {
		try {
			return this.update[this.UpdateType()].caption;
		}
		catch (err) {
			return null;
		}
	}
	ChatID() {
		try {
			return this.update[this.UpdateType()].chat.id;
		}
		catch (err) {
			return null;
		}
	}
	UserID() {
		try {
			return this.update[this.UpdateType()].from.id;
		}
		catch (err) {
			return null;
		}
	}
	UserName() {
		try {
			return this.update[this.UpdateType()].from.username;
		}
		catch (err) {
			return null;
		}
	}
	FirstName() {
		try {
			return this.update[this.UpdateType()].from.first_name;
		}
		catch (err) {
			return null;
		}
	}
	LastName() {
		try {
			return this.update[this.UpdateType()].from.last_name;
		}
		catch (err) {
			return null;
		}
	}
	Language() {
		try {
			return this.update[this.UpdateType()].from.language_code;
		}
		catch (err) {
			return null;
		}
	}
	Date() {
		try {
			return this.update[this.UpdateType()].date;
		}
		catch (err) {
			return null;
		}
	}
	Entities() {
		try {
			return this.update[this.UpdateType()].entities;
		}
		catch (err) {
			return null;
		}
	}
	MessageID() {
		try {
			return this.update[this.UpdateType()].message_id;
		}
		catch (err) {
			return null;
		}
	}
	CallbackQuery() {
		try {
			return this.update.callback_query;
		}
		catch (err) {
			return null;
		}
	}
	InlineQuery() {
		try {
			return this.update.inline_query;
		}
		catch (err) {
			return null;
		}
	}
	ForwardContentType() {
		try {
			return Object.keys(this.update[this.UpdateType()])[6];
		}
		catch (e) {
			return null;
		}

	}
	ReplyToMessage() {
		try {
			return this.update[this.UpdateType()].reply_to_message;
		}
		catch (e) {
			return null;
		}

	}
	UpdateType() {
		return Object.keys(this.update)[1]
	}
	ContentType() {
		try {
			return Object.keys(this.update[this.UpdateType()])[4];
		}
		catch (e) {
			return null;
		}
	}
	//util keyboard generators
 ForceReply(sltv=true)
 {
 	 return {force_reply: true, selective: sltv}
 }
	kb(btn = [], rk = true, otk = true, sltv = true) {
		return {
			keyboard: btn,
			resize_keyboard: rk,
			one_time_keyboard: otk,
			selective: sltv
		};
	}
	ikb(ar) {
		var kb = [];
		for (var line = 0; line < ar.length; line++) {
			kb[line] = [];
			for (var base = 0; base < ar[line].length; base++) {
				kb[line][base] = this.btn(ar[line][base]);
			};
		};
		return {
			inline_keyboard: kb
		};
	}
	btn(ctx) {
		var data = {};
		data['text'] = ctx[0];
		data[ctx[2]] = ctx[1];
		return data;
	}
}

function __request(meth, ctx, handle_response) {
	var options = {
		uri: meth,
		method: 'POST',
		json: true,
		body: ctx
	}
	rurl(options, function (error, response, json) {
		try {
			handle_response(json);
		}
		catch (e) {}
	});
}

function __initwebhook(self, port) {
	const server = http.createServer((req, res) => {
		let body = '';
		const {
			headers,
			method,
			url
		} = req;
		req.on('data', chunk => {
			body += chunk.toString(); // convert Buffer to string
		});
		req.on('end', () => {
			var data = JSON.parse(body);
			self.update = data;
		var	update_id = data['update_id']
			console.log("handling new update " + update_id)
			self.emit('handle_update', data)
			self.emit(self.UpdateType(), data[self.UpdateType()])

			res.end('ok');
		});
	});
	server.listen(port);

}

function __initlongpoll(self) {
	console.log("starting longpolling...")
	var req_tg = `${self.api}/getupdates?offset=-1&limit=1`
	rurl(req_tg, function (error, response, json) {
	var	data = JSON.parse(json);
		try {
			var update_id = data["result"][0]['update_id']
		}
		catch (err) {
			throw new Error("Please send any message to bot and try again!")
		}
		console.log(`Handling after update ${update_id}`)

		function __longpoll() {
			update_id += 1
			req_tg = `${self.api}/getupdates?offset=${update_id}&timeout=300`
			rurl(req_tg, function (error, response, json) {
				var data = JSON.parse(json);
				if (typeof data["result"][0] !== 'undefined') {
					self.update = data['result'][0];
					update_id = data["result"][0]['update_id']
					console.log("handling new update " + update_id)
					self.emit('handle_update', data['result'][0])
					self.emit(self.UpdateType(), data['result'][0][self.UpdateType()])
				}
				else {
					console.log("no updates so re-polling")
					update_id -= 1
				}
				__longpoll()
			});
		}
		__longpoll()
	});
}
module.exports = bot
