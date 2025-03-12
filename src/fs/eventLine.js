const delay = (ms) => new Promise((res) => setTimeout(res, ms));
// ihat builtins : ichat

// api definer
async function IC(apiKey, name) {
  window.support = [];
  // Example Usage
  try {
    var direct = new ic_directAPI();
    await direct.setup(apiKey);
    await delay(3000);
    var email = direct.sendMessage('e');
    localStorage.setItem('room', 'null');
    window.support.push((message) => {
      if (message.startsWith('e')) {
        console.log('[Connect] Email : ' + message.replace('e', ''));
        localStorage.setItem('email', message.replace('e', ''));
        var room = direct.sendMessage('r');
        window.support.push((message) => {
          if (message.startsWith('r')) {
            localStorage.setItem('room', message.replace('r', ''));
            console.log('[Connect] Room : ' + message.replace('r', ''));
          }
        });
      }
    });
    while (localStorage.getItem('room') == 'null') {
      await delay(200);
    }
    var email = localStorage.getItem('email');
    var room = localStorage.getItem('room');
    return new _IC(direct, name, room, email);
  } catch (err) {
    console.error('Error initializing ic_directAPI:', err);
  }
}

class _IC {
  constructor(direct, name, room, email, peer) {
    // check
    // define info
    this.info = { name: name, room: room, email: email };
    // define underneat api
    this.db = new IC_DB(this.info);
    this.api = new IC_API(this.info);
    // store message callback to call
    window.OnMessage = [];
    // function to run them if needed
    function RunonMessage(val) {
      window.OnMessage.forEach((callback) => {
        callback(val);
      });
    }
    window.conn.on('data', (data) => {
      if (data.startsWith('m')) {
        var value = {
          val: () => {
            return { message: data.replace('m', '') };
          },
        };
        RunonMessage(value);
      }
    });
    if (direct) {
      // if okeay then
    } else {
      throw new Error('[IC] Connecting failed');
    }
  }
  onMessage(callback) {
    window.OnMessage.push(callback);
  }
  send(message, r) {
    this.db.sendMessage(message, (r = r));
    try {
      return true;
    } catch {
      return false;
    }
  }
  embed(message, r) {
    this.db.sendEmbed(message, (r = r));
    try {
      return true;
    } catch {
      return false;
    }
  }
  command(name, callback, prefix = '/') {
    var name = prefix + name;
    function Gotmessage(value) {
      var message = value.val().message.replaceAll('\\n', '\n');
      if (message.startsWith(name)) {
        callback({
          message: message,
        });
      }
    }
    window.OnMessage.push(Gotmessage);
  }
}

// ichat builtins : api
class IC_API {
  constructor(info) {
    this.info = info;
  }

  email() {
    return this.info.email;
  }

  name() {
    return this.info.name;
  }

  room() {
    return this.info.room;
  }

  sendMessage(message) {
    const iframe = document.querySelector('iframe');
    iframe.contentWindow.postMessage(message, '*');
  }
}

// ichat builtins : db
class IC_DB {
  constructor(info, conn) {
    this.info = info;
    this.conn = conn;
    window.prevent = false;
  }

  sendMessage(message, type = 'message', r = '') {
    var id = this.getRoom();
    window.last = [message, id];
    window.prevent = true;

    if (window.prevent) {
      var myEmail = this.email();
      var myName = this.Name();
      var fg = message;
      if (
        message !== '' &&
        fg.replace(/\s/g, '').length !== 0 &&
        myEmail !== undefined
      ) {
        var str = message;
        var sanitizedMessage = str
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
        var renderedMessage = this.message_render(sanitizedMessage, 'nop');
        var cusid = id;

        conn.send(`m\|${cusid}\|${message}`);
        /*          email: myEmail,
          allow: 'none',
          type: type,
          message: renderedMessage,
          name: myName,
          date: Date.now(),
          dname: cusid,*/
        console.log(`Message sent : ${message}`);
      }
    }
  }

  sendEmbed(message, type = 'embed', r = '') {
    var id = this.getRoom();
    window.last = [message, id];
    window.prevent = true;

    if (window.prevent) {
      var myEmail = this.email();
      var myName = this.Name();
      var fg = message;
      if (
        message !== '' &&
        fg.replace(/\s/g, '').length !== 0 &&
        myEmail !== undefined
      ) {
        var str = message;
        var sanitizedMessage = str
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;');
        var renderedMessage = this.message_render(sanitizedMessage, 'nop');
        var cusid = id;
        conn.send(`b\|${cusid}\|${message}`);
        console.log(`Message sent : ${message}`);
      }
    }
  }

  addMessageHandler(callback) {
    if (window.onsendmessage === undefined) {
      window.onsendmessage = [];
    }
    window.onsendmessage.push(callback);
    return true;
  }

  resetMessageState() {
    window.last = undefined;
    window.prevent = false;
  }

  // Helper methods
  getRoom() {
    return this.info.room;
  }

  log(message) {
    console.log(message);
  }

  email() {
    return this.info.email;
  }

  Name() {
    return this.info.name;
  }

  message_render(message, type = 'none') {
    var messages = (function (t) {
      var r = /[^\u0300-\u036F\u0489]+/g;
      var unzalgo = function () {
        return (t.match(r) || ['']).join('');
      };
      return unzalgo();
    })(message);
    if (messages != undefined && messages != '') {
      var message_good = messages;
    } else {
      var message_good = message;
    }
    var message_start = message_good.substring(0, 100);
    if (type == 'none') {
      return link_render(message_start).replaceAll('\n', '<br>');
    } else {
      return message_start;
    }
  }
  init(callback) {
    callback(data2);
  }
}

class ic_directAPI {
  async setup(id) {
    this.peer = new Peer();
    this.conn = null;
    console.log('[Connect] Connecting to ic-hat');
    await delay(2000);
    function getID(peer) {
      if (peer.id !== undefined) return Promise.resolve(peer.id);
      return new Promise((resolve) => {
        peer.on('open', (id) => {
          resolve(id);
        });
      });
    }
    // Wait until the peer connection is open
    this.peerId = await getID(this.peer);
    console.log('[Connect] Connecting to :' + id);
    // Automatically connect to another tab or peer
    await this.autoConnect(id);
    console.log('[Connect] Conneted to ic-hat.');
    console.log('[Connect] Allowing traffic');
    await this.setupIncomingConnections();
    await delay(3000);
    console.log('[Connect] Allowed traffic');
    return this; // Return the fully initialized instance
  }

  waitForPeerOpen() {
    if (this.peer.id !== undefined) return Promise.resolve(this.peer.id);
    return new Promise((resolve) => {
      this.peer.on('open', (id) => {
        console.log(id);
        resolve(id);
      });
    });
  }

  autoConnect(myId) {
    console.warn(myId);
    const targetId = myId;
    this.conn = this.peer.connect(myId);

    this.conn.on('open', () => {
      console.log('Connected to peer: ', targetId);
      this.conn.on('data', (data) => {
        window.conn = this.conn;
        this.displayMessage('Received: ' + data);
        localStorage.setItem('lastPeer', data);
        window.support.forEach((sfunction) => {
          sfunction(data);
        });
      });
    });

    this.conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }

  setupIncomingConnections() {
    this.peer.on('connection', (incomingConn) => {
      this.conn = incomingConn;
      console.log('Connected to another tab!');
      this.conn.on('data', (data) => {
        window.conn = this.conn;
        this.displayMessage('Received: ' + data);
        localStorage.setItem('lastPeer', data);
        window.support.forEach((sfunction) => {
          sfunction(data);
        });
      });
    });
  }

  sendMessage(message) {
    if (this.conn && this.conn.open) {
      this.conn.send(message);
      this.displayMessage('Sent: ' + message);
    } else {
    }
  }

  displayMessage(message) {
    console.log('[Connect] ' + message); // You can replace this with custom UI logic
  }
}
