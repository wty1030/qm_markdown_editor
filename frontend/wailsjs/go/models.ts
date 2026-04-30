export namespace main {
	
	export class FileInfo {
	    name: string;
	    path: string;
	    isDir: boolean;
	    modTime: string;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	        this.modTime = source["modTime"];
	    }
	}
	export class FileResult {
	    success: boolean;
	    content?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new FileResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.content = source["content"];
	        this.error = source["error"];
	    }
	}

}

