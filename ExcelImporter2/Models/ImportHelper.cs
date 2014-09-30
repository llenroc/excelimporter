﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace ExcelImporter.Models
{
    public static class ImportHelper
    {
        public static void RepairObject(object obj)
        {
            // set missing keys and required attributes
            foreach (var prop in obj.GetType().GetProperties())
            {
                if (Attribute.IsDefined(prop, typeof(KeyAttribute)))
                {
                    var val = prop.GetValue(obj);
                    if (val == null)
                    {
                        if (prop.PropertyType == typeof(Guid))
                            prop.SetValue(obj, Guid.NewGuid());
                        else if (prop.PropertyType == typeof(string))
                            prop.SetValue(obj, Guid.NewGuid().ToString("N").ToString());
                    }
                }
                if (Attribute.IsDefined(prop, typeof(RequiredAttribute)))
                {
                    var val = prop.GetValue(obj);
                    if (val == null || (val is string && ((string)val) == string.Empty))
                    {
                        val = (prop.PropertyType == typeof(string) ? "-" : Activator.CreateInstance(prop.PropertyType));
                        prop.SetValue(obj, val);

                    }
                }
            }
        }

        internal static void SetRelations(IEnumerable<object> newObjects)
        {
            foreach (var obj in newObjects)
            {
                foreach (var prop in obj.GetType().GetProperties().Where(it => it.GetGetMethod().IsVirtual))
                {
                    var type = prop.PropertyType;
                    var reference = newObjects.FirstOrDefault(it => it != obj && it.GetType() == type);
                    var oldReference = prop.GetValue(obj);
                    prop.SetValue(obj, reference);
                }
            }
        }

        internal static object[] GetKeyValues(object obj)
        {
            var ret = new List<object>();
            var keys = obj.GetType().GetProperties().Where(it => Attribute.IsDefined(it, typeof(KeyAttribute))).ToList();

            keys.ForEach(it => ret.Add(it.GetValue(obj)));

            return ret.ToArray();
        }

        internal static void CopyProperties(object source, object target, IEnumerable<string> propNames)
        {
            foreach (var pn in propNames)
            {
                var prop = target.GetType().GetProperty(pn);
                if (prop != null)
                {
                    prop.SetValue(target, prop.GetValue(source));
                }
            }
        }
    }
}