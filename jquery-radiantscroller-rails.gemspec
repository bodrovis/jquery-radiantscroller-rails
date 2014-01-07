# -*- encoding: utf-8 -*-
require File.expand_path('../lib/jquery-radiantscroller-rails/version', __FILE__)

Gem::Specification.new do |gem|
  gem.authors       = ["Ilya Bodrov"]
  gem.email         = ["golosizpru@gmail.com"]
  gem.description   = "A ruby gem that uses the Rails asset pipeline to include the Radiant Scroller plugin by Ilya Bodrov
 (http://radiant-wind.com)."
  gem.summary       = "Includes javascript and css files for the Radiant Scroller plugin."
  gem.homepage      = "https://github.com/bodrovis/jquery-radiantscroller-rails"

  gem.files         = Dir["{lib,vendor}/**/*"] + ["LICENSE.txt", "README.md"]
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "jquery-radiantscroller-rails"
  gem.require_paths = ["lib"]
  gem.version       = RadiantScroller::Rails::VERSION
  gem.license       = 'MIT'

  gem.add_dependency "railties", ">= 3.1"
end
