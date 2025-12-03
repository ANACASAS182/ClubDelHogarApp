require 'xcodeproj'
begin
  require 'xcodeproj/constants'
rescue LoadError
  # algunas builds lo traen dentro de xcodeproj.rb
end

# Soporte para Xcode 16 (object version 70) en cualquiera de los mapas
if defined?(Xcodeproj::Constants::PROJECT_COMPATIBILITY_VERSION_BY_OBJECT_VERSION)
  Xcodeproj::Constants::PROJECT_COMPATIBILITY_VERSION_BY_OBJECT_VERSION[70] ||= 'Xcode 16.0'
elsif defined?(Xcodeproj::Constants::OBJECT_VERSION_TO_COMPATIBILITY_VERSION)
  Xcodeproj::Constants::OBJECT_VERSION_TO_COMPATIBILITY_VERSION[70] ||= 'Xcode 16.0'
else
  # Fallback defensivo: parchea el método que hace el mapeo
  module Xcodeproj
    class Project
      alias_method :__orig_compat, :compatibility_version_for_object_version
      def compatibility_version_for_object_version(object_version)
        return 'Xcode 16.0' if object_version.to_i == 70
        __orig_compat(object_version)
      end
    end
  end
end

puts "[patch] xcodeproj listo: object version 70 => 'Xcode 16.0'"