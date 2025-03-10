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
  constructor(direct, name, room, email) {
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
    this.db.init(RunonMessage);
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
  constructor(info) {
    /*
    console.log('refreshing iframe');
    const iframe = document.querySelector(
      'iframe[src="https://ic-hat.geoloup.com/d/session/"]'
    );
    iframe.src = '';
    iframe.src = 'https://ic-hat.geoloup.com/d/session/';
    */
    this.info = info;
    console.log('Connecting to ichat DB');
    this.firebaseConfig = {
      apiKey: 'AIzaSyD9po7l-vwO0VrY1rMYDFTYNlEBv54T6do',
      authDomain: 'ic-hat.firebaseapp.com',
      databaseURL: 'https://ic-hat-default-rtdb.firebaseio.com',
      projectId: 'ic-hat',
      storageBucket: 'ic-hat.appspot.com',
      messagingSenderId: '720687529085',
      appId: '1:720687529085:web:2d964e880c5e2398058514',
      measurementId: 'G-YC8K0D7GLR',
    };

    // Initialize Firebase
    try {
      this.app = firebase.initializeApp(this.firebaseConfig);
      this.database = firebase.database(this.app);
      window.app = this.app;
      window.database = this.database;
    } catch {
      this.app = window.app;
      this.database = window.database;
    }

    // Expose app and database for global use if needed

    window.prevent = false;
  }

  connection() {
    return this.database;
  }

  /**
   * Sends a message to Firebase.
   * @param {string} message - The message to send.
   * @param {string} [type="message"] - The type of message.
   */
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

        var mes = this.database.ref(
          'messages/' + cusid + '/' + crypto.randomUUID()
        );
        var preload = this.database.ref('preload/' + cusid + '/Message');
        preload.set({
          email: myEmail,
          allow: 'none',
          type: 'message',
          message: renderedMessage,
          name: myName,
          date: Date.now(),
          dname: cusid,
          s: r,
        });

        mes.set({
          email: myEmail,
          allow: 'none',
          type: type,
          message: renderedMessage,
          name: myName,
          date: Date.now(),
          dname: cusid,
        });
        console.log(`Message sent : ${message}`);
      }
    }
  }

  /**
   * Sends a embed to ichat.
   * @param {string} message - The message to send.
   * @param {string} [type="message"] - The type of message.
   */
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

        var preload = this.database.ref('preload/' + cusid + '/Message');
        var mes = this.database.ref(
          'messages/' + cusid + '/' + crypto.randomUUID()
        );
        preload.set({
          email: myEmail,
          allow: 'none',
          type: 'message',
          mtype: 'embed',
          message: renderedMessage,
          name: myName,
          date: Date.now(),
          dname: cusid,
          s: r,
        });

        mes.set({
          email: myEmail,
          allow: 'none',
          type: 'embed',
          mtype: 'embed',
          message: renderedMessage,
          name: myName,
          date: Date.now(),
          dname: cusid,
        });
        console.log(`Message sent : ${message}`);
      }
    }
  }

  /**
   * Adds a handler to be triggered when a message is sent.
   * @param {function} callback - The handler function to add.
   */
  addMessageHandler(callback) {
    if (window.onsendmessage === undefined) {
      window.onsendmessage = [];
    }
    window.onsendmessage.push(callback);
    return true;
  }

  /**
   * Resets the message state by clearing the last message and disabling handlers.
   */
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
    const friend_invite = this.database.ref('users_friend/');
    friend_invite.on('child_added', (data) => {
      const dnamef = data.val().dname;

      // Listen for child additions in the `preload/<dnamef>` node.
      this.database
        .ref(`preload/${dnamef}`)
        .on('child_added', async (data2) => {
          if (
            data2.val().name != null &&
            data2.val().type === 'message' &&
            data2.val().message != null &&
            data2.val().message != undefined &&
            Math.abs(new Date() - data2.val().date) <= 10000 &&
            data2.val().s != 'secret'
          ) {
            setTimeout(
              (data2) => {
                callback(data2);
              },
              1000,
              data2
            );
          }
        });
      this.database
        .ref(`preload/${dnamef}`)
        .on('child_changed', async (data2) => {
          if (
            data2.val().name != null &&
            data2.val().type === 'message' &&
            data2.val().message != null &&
            data2.val().message != undefined &&
            Math.abs(new Date() - data2.val().date) <= 10000 &&
            data2.val().s != 'secret'
          ) {
            setTimeout(
              (data2) => {
                callback(data2);
              },
              1000,
              data2
            );
          }
        });
    });
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
