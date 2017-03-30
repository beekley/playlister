# songkick-wrapper [![Build Status](https://travis-ci.org/suhdev/songkick-wrapper.svg?branch=master)](https://travis-ci.org/suhdev/songkick-wrapper)

A node.js wrapper around [songkick's](http://www.songkick.com) [API](http://www.songkick.com/developer).

## Installation

Install using [npm](https://npmjs.org):

```sh
    npm install songkick-wrapper
```

Or clone the GitHub repo:

```sh
    git clone https://github.com/suhdev/songkick-wrapper.git
```

## Usage

After installing/cloning the module, you can open a node console:

```sh
    node
```

and import the module:

```javascript
    var Songkick = require("songkick-wrapper");
```

If GitHub repo was used then: 

```javascript
    var Songkick = require("PATH TO YOUR INSTALLATION");
```

Create an instance of SongKick using the factory method passing your API key:

```javascript
    var songKick = SongKick.create("<YOUR API KEY>");

    songkick.getEventDetails("EVENT_ID","DATA_TYPE");

```

#### The returned results 

SongKick responses have the following structure: 

```json
	{
		"resultsPage":{
			"results":{

			}
		}
	}
```

The module returns the 'resultsPage' skipping the outer wrapper object for convenience. See below:

```json
	{
		"results":{

		}
	}
```

For more details documentation, have a look at the [API's reference](http://suhdev.github.io/docs/songkick-wrapper)

You can request an API key at songkick's [website](http://www.songkick.com/api_key_requests/new).

Feel free to add/change/use the module in anyway you want. :D
### Copyright
Copyright (c) 2015 Suhail Abood