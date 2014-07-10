var cloneObj = require('lodash.clone'),
    path     = require('path');



var pagination = function(opts) {
    opts = opts || {};
    var perPage = opts.perPage || 10;

    var paginate = function(filePath, collection, fileName, files) {

        var numPages = Math.ceil(collection.length/perPage),
            file     = files[fileName],
            ext      = path.extname(fileName),
            baseName = filePath || fileName.substr(0, fileName.lastIndexOf(ext)),
            last     = file,
            clone;

		var pathNow = 'index.html';

        file.pagination = {
            prev: clone,
            num: 1,
            total: numPages,
            start: 0,
            end: perPage - 1
        };

		file.pathNow = pathNow;


		for (var i = 1; i < numPages ; i++) {
			var cloneName = baseName + '-' + (i+1) + ext;
			clone = cloneObj(file, true, function (value) {
				if ( Buffer.isBuffer(value) ) {
					return value.slice();
				}
			});

			if(i+1 === 4) {
				clone.pagination.next = 0;
			}
			last.pagination.next = clone;
			clone.pagination.prev = last;
			clone.pagination.start = i * perPage;
			clone.pagination.end = i * perPage + perPage - 1;
			clone.num = i+1;
			clone.pathNow = 'index-'+(i+1) + '.html';

			files[cloneName] = clone;

			last = clone;
		}

    }


    return function(files, metalsmith, done) {
        var metadata    = metalsmith.metadata(),
            collections = metadata.collections,
            colName, file, filePath;

        for (file in files) {
            colName = files[file].paginate;
            filePath = opts.path;
            if (colName) {
                if (filePath) {
                    filePath = filePath.replace(':collection', colName);
                }
                
                paginate(filePath, collections[colName], file, files);
            }
        }

        done();
    }
}


module.exports = pagination;
