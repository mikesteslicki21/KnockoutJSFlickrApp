var Photoapp = function (config) {
    'use strict';
    
    var addWindowHandler, handleDetails, handlePhotos, buildRequestUrl, getImageUrl, defaultSort, titleSort, managePromise, manageOptions,
    
    that = this,
    defaults = {
        base: 'https://api.flickr.com/services/rest/?format=json',
        imageSize: 'd',
        sorts: []
        
    };
    
    addWindowHandler = function () {
        var origMethod,
            handlers = {
                'flickr.photosets.getInfo': handleDetails,
                'flickr.photosets.getPhotos': handlePhotos    
            };
            
        if (window.jsonFlickrApi) {
            origMethod = window.jsonFlickrApi;
        }
        
        window.jsonFlickrApi = function (data) {
            if (data.photoset.id === that.options.photosetId) {
                handlers[that.options.method](data);
            }
        };
        
        if (origMethod) {
            origMethod(data);
            
        }
        
    };
    
    buildRequestUrl = function () {
        var o = that.options;
        return [o.base, '&method=', o.method, '&photoset_id=', o.photosetId, '&api_key=', o.apiKey].join('');
        
     };
        
        
        this.getPhotosetDetails = function () {
           that.options.method = 'flickr.photosets.getInfo';
            
            $.ajax(buildRequestUrl());
            
            
        };
        
        
        this.getPhotos = function () {
            that.options.method = 'flickr.photosets.getPhotos';
            $.ajax(buildRequestUrl());
            
        };
        
        
        
        
        handleDetails = function (data) {
            that.viewModel.title(data.photoset.title._content);
            that.viewModel.desc(data.photoset.description._content);
       
            that.promise.resolve();
            
        };
    
        handlePhotos = function (data) {
            var x, model, baseObj,
                y = data.photoset.total,
                models = [];
                
            for (x = 0; x < y; x += 1) {
                model = {};
                baseObj = data.photoset.photo[x];
                baseObj.size = that.options.imageSize;
                
                model.url = getImageUrl(baseObj);
                model.title = baseObj.title;
                
                
                models.push(model);
       
        }
        
        that.viewModel.photos(models);
        
        
        };
        
        getImageUrl = function (photo) {
            return ['https://farm', photo.farm, '.staticflickr.com/', photo.server, '/', photo.id, '_', photo.secret, '_', photo.size, '.jpg' ].join('');
            
        };
        
        defaultSort = function () {
            that.viewModel.photos.sort(function (l, r) {
                return l.originalIndex === r.originalIndex ? 0 : (l.originalIndex < r.originalIndex)   
            });    
            
        }
        
           

        titleSort = function () {
            that.viewModel.photos.sort(function (l, r) {
                return l.title === r.title ? 0 : (l.title < r.title) ? -1 : 1;
            });
        };
        
        managePromise = function () {
            that.promise = $.Deferred();
            $.when(that.promise).then(that.getPhotos);
            
        };
        
        manageOptions = function () {
            that.options = $.extend(defaults, config);
            that.options.sorts.unshift({ name: 'default', sorter: defaultSort}, { name: 'title', sorter: titleSort });
            
        };
    
    return (function () {
            managePromise();
            manageOptions();
            addWindowHandler();
           that.getPhotosetDetails();
            
            that.viewModel = { 
                title: ko.observable(),
                desc: ko.observable(),
                photos: ko.observableArray(),
                sorts: ko.observableArray(that.options.sorts),
                sortHandler: function (item, e) {
                    item.sorts()[e.target.selectedIndex].sorter();
                }
          
           };
           
           
           ko.applyBindings(that.viewModel);           
           
            }());
};
