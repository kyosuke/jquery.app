
if ( typeof fireunit === "object" ) {
	QUnit.log = fireunit.ok;
	QUnit.done = fireunit.testDone;
}
$.app.debugMode = true;

test('create app', function(){
	var app1 = $.app();
	same(typeof app1, 'object', 'オブジェクトが作られる');

	var appName = 'myapp';
	var app2 = $.app(appName);
	same(app2.name, appName, 'アプリケーションの名前');

	var app3 = $.app('newMyApp');
	same(app2.name, appName, 'ほかのアプリ作ってもアプリケーションの名前はそのまま');

	var app4 = $.app(appName);
	same (app2, app4, '同じ名前のアプリケーションは同じものを返す')
});

test('run app', function(){
	expect(1);
	var app = $.app('runapp');
	app.init = function(){
		ok(true, 'init function実行');
	};
	app.run();
});

test('run app no init', function(){
	var app = $.app('runapp');
	app.run();
	ok(true, 'run実行');
});
//-----------------------------------

var app = $.app('qunitTestApp');

var bm;
module('baseModel', {
	setup: function() {
		bm = app.baseModel();
	}
});

test('create BaseModel', function(){
	same(typeof bm, 'object', 'オブジェクトが作られる');
});

test('method', function(){
	bm = app.baseModel();
	bm.method('func', function(){
		return true;
	});
	ok(bm.func(), 'メソッド実行');
	bm.method('func2', function(num){
		return num;
	});
	same(bm.func2(4), 4, '引数付');
	bm.method('func3', function(n1, n2, n3){
		return n1 + n2 + n3;
	});
	same(bm.func3(1, 2, 3), 6, '引数3つ付');
	bm.hoge= 798
	bm.method('func4', function(){
		same(this, bm, 'thisはBaseModel');
	});
	bm.func4();
});

test('bind', function(){
	expect(4);
	bm.method('func', function(){
		return true;
	});
	bm.bind('func', function(){
		ok(true, 'Listener function実行');
		same(this, bm, 'thisはBaseModel')
	})
	bm.func();

	var n = 3;
	bm.method('func2', function(num){
		return true;
	});
	bm.bind('func2', function(num){
		same(num, n, 'addLisnerのfunctionでも引数を受け取れる')
	})
	bm.func2(n);

	bm.method('func3');
	bm.bind('func3', function(){
		ok(true, 'addListner用に空のmethod定義ができる')
	})
	bm.func3();

});

/*
 * メソッドを作らずにイベントだけ起こす
 */
test('trigger', function(){
	expect(5);
	bm.bind('event1', function(){
		ok(true, 'Listener function実行');
		same(this, bm, 'thisはBaseModel');
	})
	bm.trigger('event1');

	var n = 23;
	bm.bind('event2', function(num){
		same(num, n, 'triggerでも引数を受け取れる');
	})
	bm.trigger('event2', [n]);

	var s = 'hoge', h = 'fuga';
	bm.bind('event3', function(ss, hh){
		same(ss, s, 'triggerで複数引数を受け取れる');
		same(hh, h, 'triggerで複数引数を受け取れる');
	})
	bm.trigger('event3', [s, h]);
});


test('baseModel Prototype', function(){

	ok($.app.baseModel.fn.hasOwnProperty('bind'), 'bindをbaseModel.fnに保持')
	ok($.app.baseModel.fn.hasOwnProperty('trigger'), 'triggerをbaseModel.fnに保持')
	ok($.app.baseModel.fn.hasOwnProperty('method'), 'methodをbaseModel.fnに保持')

//	for (var v in $.app.baseModel.fn){
//		if($.app.baseModel.fn.hasOwnProperty(v)) {
//			console.log('Own: '+v);
//		} else {
//			console.log(v);
//		}
//	}
	
	app.model.prototypeTest = function(){
		var o = app.baseModel();
		o.method('func', function(){
			return true;
		});
		o.method('samefunc', function(){
			return true;
		});
		return o;
	}
	var m = app.model.prototypeTest();

	ok(m.func(), 'メソッド実行');

	app.model.prototypeTest2 = function(){
		var o = app.baseModel();
		o.method('func2', function(){
			return true;
		});
		o.method('samefunc', function(){
			return true;
		});
		return o;
	}
	var m2 = app.model.prototypeTest2();
	
	ok(m2.func2(), 'メソッド実行');

//	console.log(app1.model.prototypeTest2.fn);
//	for (var v in app1.model.prototypeTest2.fn){
//		if(app1.model.prototypeTest2.fn.hasOwnProperty(v)) {
//			console.log('Own: '+v);
//		} else {
//			console.log(v);
//		}
//	}

});

test('samefunc', function(){
	expect(1);

	app.model.sametest= function(){
		var o = app.baseModel();
		o.method('samefunc', function(){
			return true;
		});
		return o;
	}
	var m = app.model.sametest();

	app.model.sametest2 = function(){
		var o = app.baseModel();
		o.method('samefunc', function(){
			return true;
		});
		return o;
	}
	var m2 = app.model.sametest2();

	m.bind('samefunc', function(){
		ok(true, 'mのsameFunc');
	});
	m2.bind('samefunc', function(){
		ok(true, 'm2のsameFunc');
	});

	m.samefunc();
});


//------------------------------

module('loaderModel');

test('create', function(){
	var loader = app.loaderModel();
	same(typeof loader, 'object', 'オブジェクトが作られる');
});

test('currentOptions no option', function(){
	var loader = app.loaderModel();
	loader.load();
	same(loader.currentOptions.cache, false, 'キャッシュしない')
});

test('currentOptions constractor option', function(){
	var loader = app.loaderModel({
		dataType: 'json'
	});
	loader.load();
	same(loader.currentOptions.cache, false, 'キャッシュしない（元の値保持）')
	same(loader.currentOptions.dataType, 'json', '追加でパラメータ設定できる')
	loader = app.loaderModel({
		cache: true,
		dataType: 'json'
	});
	loader.load();
	same(loader.currentOptions.cache, true, 'キャッシュ有効に変更可')
});

test('currentOptions load option', function(){
	var loader = app.loaderModel({
		data: {
			param: 'json'
		}
	});
	loader.load({
		data: {
			param: 'text'
		}
	});

	same(loader.currentOptions.data.param, 'text', 'loadで指定したパラメータが最優先で設定される');
});


//-----------------------------------------------------

var app, jsonm;
module('jsonModel', {
	setup: function() {
		app = $.app('qunitTestApp');
	}
});

test('create jsonModel', function(){
	jsonm = app.jsonModel();
	same(typeof jsonm, 'object', 'オブジェクトが作られる');
});

asyncTest('load', 4, function(){
	jsonm = app.jsonModel({
		url: 'test.json'
	});
	jsonm.bind('success', function(json){
		ok(true, 'successが実行された');
		ok(jsonm.data, 'dataにデータが読み込まれてる')
		same(jsonm.data, json, '引数でも同じデータが取れる')
		same(jsonm.data.file, 'test', '読み込まれたファイルが正しい')
		start();
	});
	jsonm.load();
	stop(1000);
});

asyncTest('load with uri', 4, function(){
	jsonm = app.jsonModel({
		url: 'test.json'
	});
	jsonm.bind('success', function(){
		ok(true, 'successが実行された');
		ok(jsonm.data, 'dataにデータが読み込まれてる')
		same(jsonm.data.file, 'test2', '読み込まれたファイルが正しい(load引数優先)')
		same(jsonm.currentOptions.cache, false, 'キャッシュしない');
		start();
	});
	jsonm.load({
		url: 'test2.json'
	});
	stop(1000);
});

asyncTest('load with uri and param', 5, function(){
	var uri = 'test2.json';
	var param = {m:4};
	jsonm = app.jsonModel();
	jsonm.bind('success', function(){
		ok(true, 'successが実行された');
		ok(jsonm.data, 'dataにデータが読み込まれてる')
		same(jsonm.currentOptions.url, uri, 'uriを保持');
		same(jsonm.currentOptions.data.m, param.m, 'paramを保持');
		same(jsonm.currentOptions.cache, false, 'キャッシュしない');
		start();
	});
	jsonm.load({
		url: uri,
		data: param
	});
	stop(1000);
});

asyncTest('load with param (no uri)', 4,  function(){
	var param = {m:4};
	jsonm = app.jsonModel({
		url: 'test.json'
	});
	jsonm.bind('success', function(json){
		ok(true, 'successが実行された');
		ok(jsonm.data, 'dataにデータが読み込まれてる')
		same(jsonm.data.file, 'test', '読み込まれたファイルが正しい')
		same(jsonm.currentOptions.data.m, param.m, 'paramを保持');
		start();
	});
	jsonm.load({
		data: param
	});
	stop(1000);
});

asyncTest('load base param', 2, function(){
	var uri = 'test2.json';
	var baseParam = {m:4};
	var loadParam = {y:2010};
	jsonm = app.jsonModel({
		url: uri,
		data: baseParam
	});
	jsonm.bind('success', function(){
		same(jsonm.currentOptions.data.y, loadParam.y, 'paramを保持');
		same(jsonm.currentOptions.data.m, baseParam.m, 'paramを保持');
		start();
	});
	jsonm.load({
		data: loadParam
	});
	stop(1000);
});

asyncTest('load base param', 2, function(){
	var uri = 'test2.json';
	var baseParam = {m:4};
	var loadParam = {y:2010, m:5};
	jsonm = app.jsonModel({
		url: uri,
		data: baseParam
	});
	jsonm.bind('success', function(){
		same(jsonm.currentOptions.data.y, loadParam.y, 'loadParamを保持');
		same(jsonm.currentOptions.data.m, loadParam.m, 'loadParamが優先');
		start();
	});
	jsonm.load({
		data: loadParam 
	});
	stop(1000);
});

asyncTest('load error', 2, function(){
	var uri = '404.json';
	var param = {m:4};
	jsonm = app.jsonModel();
	jsonm.bind('error', function(json){
		ok(true, 'errorが実行された');
		same(jsonm.currentOptions.data.m, param.m, 'paramを保持');
		start();
	});
	jsonm.load({
		url: uri,
		data: param
	});
	stop(1000);
});

//-----------------------------------------------------

module('csvModel', {
	setup: function() {
		app = $.app('qunitTestApp');
	}
});

test('create csvModel', function(){
	var csvm = app.csvModel();
	same(typeof csvm, 'object', 'オブジェクトが作られる');
});

asyncTest('load', function(){
	var csvm = app.csvModel({
		url: 'test.csv'
	});
	csvm.bind('success', function(csv){
		ok(true, 'successが実行された');
		ok(csvm.data, 'dataにデータが読み込まれてる')
		same(csv, csvm.data, '引数でも同じデータが取れる')
		same(csvm.data[0][0], 'test', '読み込まれたファイルが正しい')
		same(csvm.data[0][1], 'ファイルの', '読み込まれたファイルが正しい')
		same(csvm.currentOptions.cache, false, 'キャッシュしない');
		start();
	});
	csvm.load();
	stop(1000);
});

asyncTest('load error', 1, function(){
	var uri = '404.csv';
	csvm = app.csvModel();
	csvm.bind('error', function(){
		ok(true, 'onErrorが実行された');
		start();
	});
	csvm.load({
		url: uri
	});
	stop(1000);
});
//------------------------------

//-----------------------------------

var app2;
module('BaseView', {
	setup: function() {
		app2 = $.app('ViewTestApp');
	}
});

test('create', function(){
	var bv1 = app2.baseView();
	same(typeof bv1, 'object', 'オブジェクトが作られる');
	same(bv1.jquery, $().jquery, 'jQueryオブジェクト');
	same(bv1.length, 0, '内容はなし');

	var templateName = 'template_tasklist';
	var bv2 = app2.baseView(templateName);
	same(typeof bv2, 'object', 'オブジェクトが作られる');
	same(bv2.jquery, $().jquery, 'jQueryオブジェクト');
	same(bv2.data('templateId'), templateName, '指定したidの要素を取得');

	$('<div>').append(bv2);
	var bv3 = app2.baseView(templateName);
	same(bv3.length, 1, 'appendしてもtemplateはそのまま')
	
	same(bv3.attr('id'), '', 'id属性は削除されている');
});

test('$.app.template mapping', function(){
	var bv = app2.baseView('template_tasklist');

	var temp = $.app.template('li', bv);

	var dataArray = ['テスト', 'ほげほげ', 'いろいろ'];
	temp.mapping(dataArray, function(elem, value){
		elem.find('.taskText').text(value);
	});

	same(bv.find('li').length, dataArray.length, 'アイテムが追加されてる');

	$.each(dataArray, function(i, v){
		same(bv.find('li').eq(i).find('.taskText').text(), v, 'Arrayの内容' + v + 'がセットされてる')
	})

	temp.mapping(dataArray, function(elem, value){
		elem.find('.taskText').text(value);
	});

	same(bv.find('li').length, dataArray.length, '2回実行しても平気');

	var dataArray2 = ['テストa', 'aほげほげ', 'aいろいろ']
	temp.mapping(dataArray, function(elem, value){
		var temp2 = $.app.template('.taskText', elem);
		temp2.mapping(dataArray2, function(e, v){
			e.text(v);
		});
	});

	same(bv.find('li').length, dataArray.length, '入れ子しても平気');
	same(bv.find('.taskText').length, dataArray.length * dataArray2.length, '入れ子しても平気');

	$.each(dataArray, function(i, v){
		$.each(dataArray2, function(j, v2){
			same(bv.find('li').eq(i).find('.taskText').eq(j).text(), v2, 'Arrayの内容' + v2 + 'がセットされてる')
		});
	});

});

test('$.app.template add', function(){
	var bv = app2.baseView('template_tasklist');
	var temp = $.app.template('li', bv);

	temp.add(function(elem){
		elem.find('.taskText').text('文字');
	});

	same(bv.find('.taskText').last().text(), '文字', 'taskTextに文字が入っている');
});

//-----------------------------------

var app4;
module('user app object', {
	setup: function() {
		app4 = $.app('presenterTestApp');
	}
});

test('model', function(){
	same(typeof app4.model, 'object', 'オブジェクトが作られる');
});

test('view', function(){
	same(typeof app4.view, 'object', 'オブジェクトが作られる');
});



//-----------------------------------

module('util');

test('prototypeLink', function(){
	var parent = {
		func: function(){
			ok(true, 'メソッド実行');
		}
	}
	var child = $.app.prototypeLink(parent);

	child.func();
	
	ok(child.func, 'funcメソッドが存在する')
	ok(!child.hasOwnProperty('func'), 'funcは子のプロパティでない')
});



//-----------------------------------

module('parseCSV');

test('type', function(){
	var c = $.parseCSV('');
	ok($.isArray(c), 'arrayを返す');
});

test('oneLine', function(){
	var c = $.parseCSV('1,test,234');
	same(c.length, 1, 'length 1');
	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'test', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
});

test('doubleLine', function(){
	var c = $.parseCSV('1,test,234\n2,text2,567');
	same(c.length, 2, 'length 1');
	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'test', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
	same(c[1][0], '2', '2行目1列目');
	same(c[1][1], 'text2', '2行目2列目');
	same(c[1][2], '567', '2行目3列目');
});

test('tripleLine', function(){
	var c = $.parseCSV('1,test,234\n2,text2,567,\n3,text3,890');

	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'test', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
	same(c[1][0], '2', '2行目1列目');
	same(c[1][1], 'text2', '2行目2列目');
	same(c[1][2], '567', '2行目3列目');
	same(c[2][0], '3', '3行目1列目');
	same(c[2][1], 'text3', '3行目2列目');
	same(c[2][2], '890', '3行目3列目');
});

test('CRLF', function(){
	var c = $.parseCSV('1,test,234\r\n2,text2,567,\r\n3,text3,890');

	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'test', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
	same(c[1][0], '2', '2行目1列目');
	same(c[1][1], 'text2', '2行目2列目');
	same(c[1][2], '567', '2行目3列目');
	same(c[2][0], '3', '3行目1列目');
	same(c[2][1], 'text3', '3行目2列目');
	same(c[2][2], '890', '3行目3列目');
});

test('CR', function(){
	var c = $.parseCSV('1,test,234\r2,text2,567,\r3,text3,890');

	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'test', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
	same(c[1][0], '2', '2行目1列目');
	same(c[1][1], 'text2', '2行目2列目');
	same(c[1][2], '567', '2行目3列目');
	same(c[2][0], '3', '3行目1列目');
	same(c[2][1], 'text3', '3行目2列目');
	same(c[2][2], '890', '3行目3列目');
});

test('zero', function(){
	var c = $.parseCSV('');
	same(c.length, 0, 'length 0');
});

test('"によるグループ化', function(){
	var c = $.parseCSV('1,"te,st",234\n2,text2,567,\n3,text3,890');

	same(c[0][0], '1', '1行目1列目');
	same(c[0][1], 'te,st', '1行目2列目');
	same(c[0][2], '234', '1行目3列目');
	same(c[1][0], '2', '2行目1列目');
	same(c[1][1], 'text2', '2行目2列目');
	same(c[1][2], '567', '2行目3列目');
	same(c[2][0], '3', '3行目1列目');
	same(c[2][1], 'text3', '3行目2列目');
	same(c[2][2], '890', '3行目3列目');

	c = $.parseCSV('1,"te\nst",234\n2,text2,567,\n3,text3,890');
	same(c[0][1], 'te\nst', '"で囲まれた改行');
	c = $.parseCSV('1,"te\nst","2\n34"\n2,text2,567,\n3,text3,890');
	same(c[0][2], '2\n34', '"で囲まれた改行');
	c = $.parseCSV('1,"te\nst","<a href=""#hoge"">test</a>"\n2,text2,567,\n3,text3,890');
	same(c[0][2], '<a href="#hoge">test</a>', '"が含まれたセル')

	c = $.parseCSV('1,"te\nst","<a href=""#hoge\n"">test\n</a>"\n2,text2,567,\n3,text3,890');
	same(c[0][2], '<a href="#hoge\n">test\n</a>', '"が含まれたセル')
});


/*
test("module without setup/teardown (default)", function() {
	expect(1);
	ok(true);
});

test("expect in test", 3, function() {
	ok(true);
	ok(true);
	ok(true);
});

test("expect in test", 1, function() {
	ok(true);
});

module("setup test", {
	setup: function() {
		ok(true);
	}
});

test("module with setup", function() {
	expect(2);
	ok(true);
});

var state;

module("setup/teardown test", {
	setup: function() {
		state = true;
		ok(true);
	},
	teardown: function() {
		ok(true);
	}
});

test("module with setup/teardown", function() {
	expect(3);
	ok(true);
});

module("setup/teardown test 2");

test("module without setup/teardown", function() {
	expect(1);
	ok(true);
});

if (typeof setTimeout !== 'undefined') {
state = 'fail';

module("teardown and stop", {
	teardown: function() {
		equals(state, "done", "Test teardown.");
	}
});

test("teardown must be called after test ended", function() {
	expect(1);
	stop();
	setTimeout(function() {
		state = "done";
		start();
	}, 13);
});
} // end setTimeout tests

if (typeof asyncTest !== 'undefined') {
module("asyncTest");

asyncTest("asyncTest", function() {
	expect(2);
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});

asyncTest("asyncTest", 2, function() {
	ok(true);
	setTimeout(function() {
		state = "done";
		ok(true);
		start();
	}, 13);
});
} // end asyncTest tests

module("save scope", {
	setup: function() {
		this.foo = "bar";
	},
	teardown: function() {
		same(this.foo, "bar");
	}
});
test("scope check", function() {
	expect(2);
	same(this.foo, "bar");
});

module("simple testEnvironment setup", {
	foo: "bar",
	bugid: "#5311" // example of meta-data
});
test("scope check", function() {
	same(this.foo, "bar");
});
test("modify testEnvironment",function() {
	this.foo="hamster";
});
test("testEnvironment reset for next test",function() {
	same(this.foo, "bar");
});

module("testEnvironment with object", {
	options:{
		recipe:"soup",
		ingredients:["hamster","onions"]
	}
});
test("scope check", function() {
	same(this.options, {recipe:"soup",ingredients:["hamster","onions"]}) ;
});
test("modify testEnvironment",function() {
	// since we do a shallow copy, the testEnvironment can be modified
	this.options.ingredients.push("carrots");
});
test("testEnvironment reset for next test",function() {
	same(this.options, {recipe:"soup",ingredients:["hamster","onions","carrots"]}, "Is this a bug or a feature? Could do a deep copy") ;
});


module("testEnvironment tests");

function makeurl() {
  var testEnv = QUnit.current_testEnvironment;
  var url = testEnv.url || 'http://example.com/search';
  var q   = testEnv.q   || 'a search test';
  return url + '?q='+encodeURIComponent(q);
}

test("makeurl working",function() {
	equals( QUnit.current_testEnvironment, this, 'The current testEnvironment is global');
  equals( makeurl(), 'http://example.com/search?q=a%20search%20test', 'makeurl returns a default url if nothing specified in the testEnvironment');
});

module("testEnvironment with makeurl settings",{
  url:'http://google.com/',
  q:'another_search_test'
});
test("makeurl working with settings from testEnvironment",function() {
  equals( makeurl(), 'http://google.com/?q=another_search_test', 'rather than passing arguments, we use test metadata to form the url');
});
test("each test can extend the module testEnvironment", {
	q:'hamstersoup'
}, function() {
	equals( makeurl(), 'http://google.com/?q=hamstersoup', 'url from module, q from test'); 
});

*/
