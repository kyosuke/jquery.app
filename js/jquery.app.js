/**
 * jQuery app framework plugin
 * Copyright 2010 pxgrid.com
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function($){
	var appList = {};

	$.app = function(appName){
		if (appList[appName]) {
			return appList[appName];
		}
		var o = $.app.prototypeLink($.app.fn);
		appList[appName] = o;
		o.name = appName;
		o.model = {};
		o.view = {};
		return o;
	};

	$.app.fn = {
		init: function(){},
		run: function(){
			this.init();
		}
	};

	$.app.baseModel = $.app.fn.baseModel = function(){
		var o = $.app.prototypeLink($.app.baseModel.fn);
		o.observer = {};
		return o;
	};

	$.app.baseModel.fn = {
		bind: function(funcName, func){
			var o = this;
			if (!o.observer[funcName]) {
				o.observer[funcName] = [];
			}
			o.observer[funcName].push(func);
		},
		trigger: function(funcName, argArray){
			var o = this;
			if (!o.observer[funcName]) {
				return;
			}
			$.each(o.observer[funcName], function(i, fn){
				fn.apply(o, argArray || []);
			});
		},
		method: function(funcName, func){
			var o = this;
			o[funcName] = function(){
				var result;
				if (typeof func === 'function') {
					result = func.apply(o, arguments);
				}
				o.trigger(funcName, arguments);
				return result;
			};
		}
	};

	$.app.loaderModel = $.app.fn.loaderModel = function(constractorOptions) {
		var o = $.app.baseModel();
		o.defaultOptions = constractorOptions || {};
		o.defaultOptions.data = o.defaultOptions.data || {};
		o.method('load', function(loaderOptions){
			if (loaderOptions && loaderOptions.data) {
				loaderOptions.data = $.extend({}, o.defaultOptions.data, loaderOptions.data);
			}
			o.currentOptions = $.extend({
				cache: false,
				error: function(){
					o.trigger('error', arguments);
				},
				success: function(){
					o.trigger('success', arguments);
				},
				complate: function(){
					o.trigger('complate', arguments);
				}
			}, o.defaultOptions, loaderOptions);
			$.ajax(o.currentOptions);
		});
		return o;
	};
	
	$.app.jsonModel = $.app.fn.jsonModel = function(constractorOptions) {
		var option = constractorOptions || {};
		option.dataType = 'json';
		var o = $.app.loaderModel(option);
		o.defaultOptions.success = function(json) {
			o.data = json;
			o.trigger('success', arguments);
		};
		return o;
	};

	$.app.csvModel = $.app.fn.csvModel = function(constractorOptions) {
		var option = constractorOptions || {};
		option.dataType = 'text';
		var o = $.app.loaderModel(option);
		o.defaultOptions.success = function(s) {
			o.data = $.parseCSV(s);
			o.trigger('success', [o.data]);
		};
		return o;
	};

	$.app.baseView = $.app.fn.baseView = function(idName) {
		var o = $('#'+idName).clone().removeAttr('id');
		o.data('templateId', idName);
		return o;
	};

	$.app.template = function(selector, context){
		var o = $.app.prototypeLink($.app.template.fn);
		o.selector = selector;
		o.elem = context.find(selector);
		o.template = o.elem.clone();
		o.parent = o.elem.parent();
		return o;
	};

	$.app.template.fn = {
		clear: function(){
			var o = this;
			o.parent.find(o.selector).remove();
		},
		add: function(fn, v){
			var o = this;
			var elem= o.template.clone();
			fn(elem, v);
			o.parent.append(elem);
		},
		mapping: function(a, fn){
			var o = this;
			o.clear();
			$.each(a, function(i, v){
				o.add(fn, v);
			});
		}
	};

	/*
	 * util
	 */
	$.app.prototypeLink = function(o){
		var f = function(){};
		f.prototype = o;
		return new f();
	};

})(jQuery);


/**
 * jQuery parseCSV plugin
 * Copyright 2010 pxgrid.com
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

(function($){
	
	var nowrapStringMap = function(s, delimiter, fn) {
		return $.map(s.split(delimiter), function(n, i){
			return (i%2) ? n : fn(n);
		}).join(delimiter);
	};

	var nowrapStringReplace = function(s, findString, newString) {
		return nowrapStringMap(s, '"', function(s){
			return s.replace(findString, newString);
		});
	};

	/**
	 * csv string to two-dimensional array
	 */
	$.parseCSV = function(s){
		var result = [];
		s = nowrapStringReplace(s, /\r?\n/g, '[[[\n]]]');
		s = nowrapStringReplace(s, /\r/g, '[[[\n]]]');
		s = nowrapStringReplace(s, /,/g, '[[[,]]]');
		s = s.replace(/""/g, '[[["]]]');
		var lines = s.split('[[[\n]]]');
		$.each(lines, function(lineIndex, line){
			var l = line.split('[[[,]]]');
			l = $.map(l, function(n, i){
				n = n.replace(/^"([\s\S]*)"$/, '$1');
				n = n.replace(/\[\[\["\]\]\]/g, '"');
				return n;
			});
			if (l.length && l[0]) {
				result.push(l);
			}
		});
		return result;
	};

})(jQuery);
