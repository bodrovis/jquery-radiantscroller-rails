# RadiamtScroller plugin for Rails

A ruby gem that uses the Rails asset pipeline to include the Radiant Scroller plugin by Ilya Bodrov
 (http://radiant-wind.com):

* Homepage: https://github.com/bodrovis/RadiantScroller

## Installation

Add this line to your application's Gemfile:

    gem 'jquery-radiantscroller-rails'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install jquery-radiantscroller-rails

NOTE: this is a jQuery plugin so you will also need the `jquery-rails` gem:

* https://github.com/rails/jquery-rails

If you want to enable mousewheel support for Radiant Scroller, you can include jQuery MouseWheel plugin by Brandon Aaron
(https://github.com/brandonaaron/jquery-mousewheel/). There is a gem `jquery-mousewheel-rails` available:

* https://github.com/crazymykl/jquery-mousewheel-rails

## Usage

In your `application.js` you will need to add this line:

    //= require jquery.radiantscroller
   
And in your `application.css` you will need to add this line:

    *= require jquery.radiantscroller

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License

This plugin is licensed under the [MIT License](https://github.com/bodrovis/jquery-radiantscroller-rails/blob/master/LICENSE.txt).

Copyright (c) 2014 [Ilya Bodrov](http://radiant-wind.com)
