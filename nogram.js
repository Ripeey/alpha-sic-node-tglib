const query = require('events')
const rurl = require('request');
const http = require('http');
const site = "https://api.telegram.org/bot"
class bot extends query {
	constructor(key, type = 3000, data = null) {
		super();
		this.api = site + key + '/';
		this.update = null;
		type === true ? __initlongpoll(this) : type === false ? this.update = data : __initwebhook(this, type)
		return new Proxy(this, {
			get(target, name) {
				return function () {
					try {
						return target[name](...arguments)
					}
					catch (e) {
						//All api method calls
			  return arguments.length==1? __request(`${target.api+name}`,{}, ...arguments): __request(`${target.api+name}`, ...arguments)
  		}
				}

			}
		})
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
	ForceReply(sltv = true) {
		return {
			force_reply: true,
			selective: sltv
		}
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
			var update_id = data['update_id']
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
	var req_tg = `${self.api}getupdates?offset=-1&limit=1`
	rurl(req_tg, function (error, response, json) {
		var data = JSON.parse(json);
		try {
			var update_id = data["result"][0]['update_id']
		}
		catch (err) {
			throw new Error("Please send any message to bot and try again!")
		}
		console.log(`Handling after update ${update_id}`)

		function __longpoll() {
			update_id += 1
			req_tg = `${self.api}getupdates?offset=${update_id}&timeout=300`
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